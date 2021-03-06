/*
 * home-controller.ts
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

import { NextFunction, Response, Request } from 'express';
import sanitize from 'mongo-sanitize';

import * as InfluxHelper from '../utils/influxHelper';
import User from '../models/User';
import FlashMessages from '../utils/flash-messages';

export async function renderOtherDataPage(req: Request, res: Response, next: NextFunction) {
	const showUser: any = sanitize(req.query.showUser);

	let granter = await User.findOne({ username: showUser });
	if (!granter || !req.user!.hasPermissionFrom(granter.id, 'read' as any)) {
		req.flashError(FlashMessages.NO_READ_ACCESS);
		return res.redirect('/');
	}

	let raspberrys = await User.find({role: 'raspberry'});
	let raspgranter = "";

	raspberrys.forEach(function(rasp) {
		if(rasp.raspberry!.owner == granter!.id){
			raspgranter = rasp.raspberry!.mac;
		}
	});

	const userResults = await InfluxHelper.query(
		`SELECT SUM(production) AS production,
			SUM(consumption) AS consumption,
			SUM(surplus) AS surplus
			FROM EnergyRecord
			WHERE raspberry_mac =~ /(?i)^${raspgranter}$/
			AND time >= now() - 1d
			AND time <= now()
			GROUP BY time(15m) fill(none)`
	);

	res.render('other-data', {
		otherUserData: {
			time       : userResults.rows.map((r: any) => r.time.toNanoISOString()),
			production : userResults.rows.map((r: any) => r.production),
			consumption: userResults.rows.map((r: any) => r.consumption),
			surplus    : userResults.rows.map((r: any) => r.surplus),
		},
		otherUser: granter,
		user     : req.user,
	});
}
