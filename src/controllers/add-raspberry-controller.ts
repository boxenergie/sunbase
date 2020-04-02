/*
 * add-raspberry-controller.ts
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

import logger from '../utils/logger';
import * as InfluxHelper from '../utils/InfluxHelper';

export async function renderAddRaspberryPage(req: Request, res: Response, next: NextFunction) {
	try {
		res.render('add-raspberry', {
			csrfToken: req.csrfToken(),
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function addRaspberry(req: Request, res: Response, next: NextFunction) {
	try {
		const code = req.body.code;
		const error = (msg: string) => req.flash('errorMsg', msg);
		const succeed = (msg: string) => req.flash('successMsg', msg);

		// ! TODO reduce precision, allow error margin
		// ! TODO Maybe check for all users ? revamp necessary ?
		// Try to find the correct code (production) in the last hour
		const result = await InfluxHelper.query(
			`SELECT *
			FROM EnergyRecord
			WHERE production = ${code} AND time >= now() - 1h AND time <= now()`
		);

		if (result.rows.length == 0) {
			error('Your code is invalid.');
			return res.redirect('/profil/add-raspberry');
		}
		else if (result.rows.length > 1) {
			error('Please retry in 1h.');
			return res.redirect('/profil/add-raspberry');
		};

		if (!req.user!.raspberries.includes(result.rows[0].raspberry_uuid)) {
			req.user!.raspberries.push(result.rows[0].raspberry_uuid);
			req.user!.save();

			succeed('Successfully linked your raspberry to your account !')
		}
		else
			error('This raspberry is already linked to your account !');

		return res.redirect('/profil/add-raspberry');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
