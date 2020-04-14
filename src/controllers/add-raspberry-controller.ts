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
import sanitize from 'mongo-sanitize';

import * as InfluxHelper from '../utils/InfluxHelper';
import logger from '../utils/logger';
import User from '../models/User';

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
		// Margin of error allowed to find a correct production_index
		const MARGIN = 5; // - 5%
		const production:number = sanitize(Number(req.body.production));
		const label:string = sanitize(req.body.label);
		const password:string = sanitize(req.body.password)
		const error = (msg: string) => req.flash('errorMsg', msg);
		const succeed = (msg: string) => req.flash('successMsg', msg);

		/**
		 * Try to find all results between
		 * production - 5% < ? < production
		 * Only the latest record of each UNIQUE raspberry is kept
		 */
		const result = await InfluxHelper.query(
			`SELECT *
			FROM EnergyRecord
			WHERE 
			production_index > ${production * ((100-MARGIN)/100)}
			AND production_index < ${production}
			AND time >= now() - 1h
			AND time <= now()
			GROUP BY raspberry_uuid
			ORDER BY desc
			LIMIT 1`
		);

		if (result.rows.length == 0) {
			error('Your production is invalid.');
			return res.redirect('/profil/add-raspberry');
		}
		else if (result.rows.length > 1) {
			error('Please retry in 1h.');
			return res.redirect('/profil/add-raspberry');
		};

		try {
			const raspberry = await User.create({
				username: `${req.user!.username}/${label}`,
				password: password,
				role: 'raspberry',
				raspberry: {
					label: label,
					uuid: result.rows[0].raspberry_uuid
				}
			});
			
			await raspberry!.grantPermissionTo(req.user!, 'aggregate' as any);

			succeed(`
				Successfully linked your raspberry to your account !
				You can connect manage this raspberry by connecting to the following account:
				Username: ${req.user!.username}/${label}
				Password: The one you specified
			`);
		}
		catch (err) {
			error('This raspberry is already linked to an account !')
		}
		finally {
			return res.redirect('/profil/add-raspberry');
		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
