/*
 * jobs.ts
 * Copyright (C) 2019-2020 Sunshare, Evrard Teddy, Hervé Fabien, Rouchouze Alexandre
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

import axios from 'axios';

import logger from '../utils/logger';

const meteoControlApiURL = 'http://ws.meteocontrol.de/api/sites/XRA24/data/energygeneration';
const sunShareApiURL = `http://localhost:${process.env.PORT}/api/v1/energy`;

const jobs: Array<[string, (fireDate: Date) => void]> = [];

const fetchAFULData = async (_: Date) => {
	try {
		const res: any = await axios.get(
			`${meteoControlApiURL}?apiKey=${process.env.METEO_CONTROL_API_KEY}`
		);
		const last = res.data.chartData.data.reverse().find((v: [number, number]) => v[1] !== null);

		await axios.post(sunShareApiURL, {
			production: last[1],
			raspberry_mac: process.env.AFUL_MAC,
		});

		logger.info(`Succesfully fetch data from Meteo Control: ${last[1]} kW`);
	} catch (err) {
		logger.error(
			`Impossible to fetch Meteo Control data: ${err.message}; ${err?.response.data.Message}`
		);
	}
};
// Every 5mn, i.e XX:00 XX:05 XX:10 XX:15...
jobs.push(['*/5 * * * *', fetchAFULData]);

export default jobs;
