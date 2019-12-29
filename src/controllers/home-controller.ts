import * as Sqrl from 'squirrelly';
import { NextFunction, Response, Request } from "express";

import Records from '../db/influxdb';

export async function render(req: Request, res: Response, next: NextFunction) {
	try {
		const results = await Records.query(
			`SELECT SUM("production") AS production,
			SUM("consumption") AS consumption,
			SUM("surplus") AS surplus
			from "EnergyRecord"`
		);

		res.send(
			//@ts-ignore
			Sqrl.renderFile("./views/homepage.squirrelly", { test: results[0] })
		);
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}