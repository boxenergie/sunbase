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
import * as Sqrl from 'squirrelly';

import Records from '../db/influxdb';

export async function renderHomePage(req: Request, res: Response, next: NextFunction) {
	try {
		const results = await Records.query(
			`SELECT SUM("production") AS production,
			SUM("consumption") AS consumption,
			SUM("surplus") AS surplus
			FROM "EnergyRecord"`
		);

		const userResults = await Records.query(
			`SELECT SUM("production") AS production,
			SUM("consumption") AS consumption,
			SUM("surplus") AS surplus
			FROM "EnergyRecord"
			WHERE created_by = '${req.user?.id}'`
		);

		res.send(
			Sqrl.renderFile("./views/home-page.squirrelly", { 
				data: results[0],
				userData: userResults[0],
				user: req.user,
			})
		);
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}
