/*
 * influxdb.ts
 * Copyright (C) Sunshare 2019
 *
 * This file is part of Sunbase.
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as Influx from 'influx';

const influxClient = new Influx.InfluxDB({
	database: process.env.INFLUX_DB_NAME ?? 'SunShare',
	schema: [
		{
			measurement: 'EnergyRecord',
			fields: {
				production_index: Influx.FieldType.INTEGER,
				production: Influx.FieldType.INTEGER,
				consumption: Influx.FieldType.INTEGER,
				surplus: Influx.FieldType.INTEGER
			},
			tags: [
				'raspberry_uuid'
			]
		},
		{
			measurement: 'WindRecord',
			fields: {
				wind_speed: Influx.FieldType.FLOAT,
				production: Influx.FieldType.FLOAT,
				rotor_speed: Influx.FieldType.FLOAT,
				relative_orientation: Influx.FieldType.FLOAT
			},
			tags: [
				'raspberry_uuid'
			]
		},
	]
});

influxClient.createDatabase(process.env.INFLUX_DB_NAME ?? 'SunShare');

export default influxClient;
