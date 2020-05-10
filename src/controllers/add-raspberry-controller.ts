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

import { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

import * as InfluxHelper from '../utils/InfluxHelper';
import logger from '../utils/logger';
import User from '../models/User';
import FlashMessages from "./flash-messages";

export async function renderAddRaspberryPage(req: Request, res: Response, next: NextFunction) {
	try {
		res.render('add-raspberry', {
			csrfToken: req.csrfToken(),
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
			user: req.user,
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function addRaspberry(req: Request, res: Response, next: NextFunction) {
	try {
		// Margin of error allowed to find a correct withdrawal_index
		const MARGIN = 5; // - 5%
		const label:string = sanitize(req.body.label);
		const password:string = sanitize(req.body.password);
		const withdrawal:number = sanitize(Number(req.body?.withdrawal));
		const mac: string = sanitize(req.body?.mac);
		const error = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('errorMsg', msg, ...params);
		const succeed = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('successMsg', msg, ...params);

		let result;
		// Withdrawal, no MAC
		if (withdrawal) {
			/**
			 * Try to find all results between
			 * [withdrawal - 5% ; withdrawal]
			 * Only the latest record of each UNIQUE raspberry is kept
			 */
			result = await InfluxHelper.query(
				`SELECT *
				FROM EnergyRecord
				WHERE 
				withdrawal_index >= ${withdrawal * ((100-MARGIN)/100)}
				AND withdrawal_index <= ${withdrawal}
				AND time >= now() - 1h
				AND time <= now()
				GROUP BY raspberry_mac
				ORDER BY desc
				LIMIT 1`
			);

			if (result.rows.length == 0) {
				error(FlashMessages.INVALID_RASPBERRY_INDEX);
				return res.redirect('/profil/add-raspberry');
			}
			else if (result.rows.length > 1) {
				error(FlashMessages.TOO_MANY_CANDIDATES);
				return res.redirect('/profil/add-raspberry');
			}
		}
		// MAC, no withdrawal
		else {
			// Check there is at least 1 record with this mac
			result = await InfluxHelper.query(
				`SELECT *
				FROM EnergyRecord
				WHERE 
				raspberry_mac =~ /(?i)^${mac}$/
				AND time >= now() - 1h
				AND time <= now()`
			);

			if (result.rows.length === 0) {
				error(FlashMessages.UNRECOGNIZED_MAC);
				return res.redirect('/profil/add-raspberry');
			}
		}

		try {
			const username = req.user!.username;
			const raspberry = await User.create({
				username: `${username}/${label}`,
				password: password,
				role: 'raspberry',
				raspberry: {
					label: label,
					mac: mac ?? result.rows[0].raspberry_mac,
					owner: req.user!._id,
				}
			});
			
			await raspberry!.grantPermissionTo(req.user!, 'aggregate' as any);

			succeed(FlashMessages.RASPBERRY_LINKED, username, label);

			logger.info(`Succesfully linked raspberry '${mac ?? result.rows[0].raspberry_mac} with user ${username}`);
		}
		catch (err) {
			if (err.name === 'ValidationError') {
				logger.debug(err.message);

				const erroringField = err.errors[Object.keys(err.errors)[0]].path;
				error(FlashMessages.INVALID_AUTH_FIELD, erroringField);
			}
			else {
				error(FlashMessages.ALREADY_LINKED);
			}
		}
		finally {
			return res.redirect('/profil/add-raspberry');
		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
