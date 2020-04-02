/*
 * home-controller.ts
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

import { NextFunction, Response, Request } from "express";

import * as InfluxHelper from '../utils/InfluxHelper';
import logger from '../utils/logger';

export async function renderHomePage(req: Request, res: Response, next: NextFunction) {
	try {
		const globalResults = await InfluxHelper.query(
			`SELECT SUM(production) AS production,
			SUM(consumption) AS consumption,
			SUM(surplus) AS surplus
			FROM "EnergyRecord"
			WHERE time >= now() - 1d AND time <= now()
			GROUP BY time(15m) fill(none)`
		);

		const userResults = [];
		if (req.isAuthenticated()) {
			for (const raspberry of req.user!.raspberries) {
				const query = await InfluxHelper.query(
					`SELECT SUM(production) AS production,
					SUM(consumption) AS consumption,
					SUM(surplus) AS surplus
					FROM "EnergyRecord"
					WHERE raspberry_uuid = '${raspberry}' AND time >= now() - 1d AND time <= now()
					GROUP BY time(15m) fill(none)`
				);

				userResults.push({
					name: raspberry,
					values: {
						time: query.rows.map((r: any) => r.time.toNanoISOString()),
						production: query.rows.map((r: any) => r.production),
						consumption: query.rows.map((r: any) => r.consumption),
						surplus: query.rows.map((r: any) => r.surplus),
					},
				});
			}
		}

		res.render('home', {
			globalData: {
				time: globalResults.rows.map((r: any) => r.time.toNanoISOString()),
				production: globalResults.rows.map((r: any) => r.production),
				consumption: globalResults.rows.map((r: any) => r.consumption),
				surplus: globalResults.rows.map((r: any) => r.surplus),
			},
			userData: userResults,
			user: req.user,
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
