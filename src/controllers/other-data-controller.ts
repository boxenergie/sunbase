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

import { NextFunction, Response, Request } from 'express';

import * as InfluxHelper from '../utils/InfluxHelper';
import logger from '../utils/logger';
import User from "../models/User";
import FlashMessages from "./flash-messages";

export async function renderOtherDataPage(req: Request, res: Response, next: NextFunction) {
	try {
		let granter = await User.findOne({ username : req.query.showUser as string });
		if (!granter || !req.user!.hasPermissionFrom(granter.id, 'read' as any)) {
			req.flashLocalized('errorMsg', FlashMessages.NO_READ_ACCESS);
			return res.redirect('/');
		}
		const userResults = await InfluxHelper.query(
			`SELECT SUM(production) AS production,
			SUM(consumption) AS consumption,
			SUM(surplus) AS surplus
			FROM "EnergyRecord"
			WHERE raspberry_mac =~ /(?i)^${granter.id}$/ AND time >= now() - 1d AND time <= now()
			GROUP BY time(15m) fill(none)`
		);

		res.render('other-data', {
			otherUserData: {
				time: userResults.rows.map((r: any) => r.time.toNanoISOString()),
				production: userResults.rows.map((r: any) => r.production),
				consumption: userResults.rows.map((r: any) => r.consumption),
				surplus: userResults.rows.map((r: any) => r.surplus),
			},
			otherUser: granter,
			user: req.user,
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
