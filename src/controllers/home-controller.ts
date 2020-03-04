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
			`SELECT SUM("production") AS production,
			SUM("consumption") AS consumption,
			SUM("surplus") AS surplus
			FROM "EnergyRecord"`
		, { deleteTimestamp: true });

		const userResults = await InfluxHelper.query(
			`SELECT SUM("production") AS production,
			SUM("consumption") AS consumption,
			SUM("surplus") AS surplus
			FROM "EnergyRecord"
			WHERE created_by = '${req.user?.id}'`
		, { deleteTimestamp: true });

		res.render("home-page", { 
			globalData: globalResults.rows[0],
			userData: userResults.rows[0],
			user: req.user,
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
