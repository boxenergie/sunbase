import { escape, IPoint } from 'influx';
import InfluxClient from '../db/influxdb';

export interface InfluxHelperOptions {
	// Delete the timestamp field on all results
	deleteTimestamp?: boolean
}

export interface InfluxQueryResponse {
	// Name of the table
	name: string,
	rows: Array<InfluxRows>,
	tags: {}
}

export interface InfluxRows {
	time?: string,

	[key: string]: any
}

export async function query<T>(query: string, options: InfluxHelperOptions = {}): Promise<InfluxRows> {
	return InfluxClient.query<T>(query)
		.then((res: any) => res.groupRows[0])
		.then((res: InfluxQueryResponse) => {
			if (options.deleteTimestamp && res) {
				for (const r of res.rows) delete r.time;
			}

			return res
				? { rows: res.rows }
				: { rows: [] };
		});
}

export interface InfluxPoint {
	fields: { [key: string]: any },
	tags: { [key: string]: string }
}

export async function insert(tableName: string, data: InfluxPoint[]) {
	const points: IPoint[] = [];

	for (const point of data) {
		for (let key in point.tags) {
			point.tags[key] = escape.tag(point.tags[key]);
		}

		points.push(
			{
				measurement: escape.measurement(tableName),
				fields: point.fields,
				tags: point.tags,
			}
		);
	}

	return InfluxClient.writePoints(points);
}
