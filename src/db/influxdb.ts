/*
 * influxdb.ts
 * Copyright (C) Sunshare 2019
 * This file is part of Sunbase.
 * Sunbase is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * Sunbase is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with Sunbase. If not, see <http://www.gnu.org/licenses/>.
 */

import * as Influx from 'influx';

const influxClient = new Influx.InfluxDB({
	database: 'SunShare',
	schema: [
		{
			measurement: 'EnergyRecord',
			fields: {
				production: Influx.FieldType.INTEGER,
				consumption: Influx.FieldType.INTEGER,
				surplus: Influx.FieldType.INTEGER
			},
			tags: [
				'created_by'
			]
		}
	]
});

influxClient.createDatabase('SunShare');

export default influxClient;
