/*
 * add-raspberry-controller.ts
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

import { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

import * as InfluxHelper from '../utils/influxHelper';
import logger from '../utils/logger';
import User from '../models/User';
import FlashMessages from '../utils/flash-messages';

export async function renderAddRaspberryPage(req: Request, res: Response, next: NextFunction) {
	res.render('add-raspberry', {
		csrfToken : req.csrfToken(),
		errorMsg  : req.flash('errorMsg'),
		successMsg: req.flash('successMsg'),
		user      : req.user,
	});
}

export async function addRaspberry(req: Request, res: Response, next: NextFunction) {
	// Margin of error allowed to find a correct withdrawal_index
	const MARGIN             = 5;                                              // - 5%
	const label: string      = sanitize(req.body.label);
	const password: string   = sanitize(req.body.password);
	const withdrawal: number = sanitize(Number(req.body?.withdrawal * 1000));
	const mac: string        = sanitize(req.body?.mac);

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
				withdrawal_index >= ${withdrawal * ((100 - MARGIN) / 100)}
				AND withdrawal_index <= ${withdrawal}
				AND time >= now() - 1h
				AND time <= now()
				GROUP BY raspberry_mac
				ORDER BY desc
				LIMIT 1`
		);

		if (result.rows.length == 0) {
			req.flashError(FlashMessages.INVALID_RASPBERRY_INDEX);
			return res.redirect('/profil/add-raspberry');
		} else if (result.rows.length > 1) {
			req.flashError(FlashMessages.TOO_MANY_CANDIDATES);
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
			req.flashError(FlashMessages.UNRECOGNIZED_MAC);
			return res.redirect('/profil/add-raspberry');
		}
	}

	// Once we are here, it's time to link the user and the raspberry
	try {
		// So we begin by creating the raspberry user
		const username  = req.user!.username;
		const raspberry = await User.create({
			username: `${username}/${label}`,
			password: password,
			role: 'raspberry',
			raspberry: {
				label: label,
				mac: mac ?? result.rows[0].raspberry_mac,
				owner: req.user!._id,
			},
		});

		// Then we make the new raspberry give the permission to the user
		await raspberry!.grantPermissionTo(req.user!, 'aggregate' as any);

		req.flashSuccess(FlashMessages.RASPBERRY_LINKED, username, label);

		logger.info(
			`Succesfully linked raspberry '${
				mac ?? result.rows[0].raspberry_mac
			} with user ${username}`
		);
	} catch (err) {
		// ValidationError occurs when a field does NOT respect the validation rules defined
		// inside Mongoose Schema
		if (err.name === 'ValidationError') {
			logger.debug(err.message);

			const erroringField = err.errors[Object.keys(err.errors)[0]].path;
			req.flashError(FlashMessages.INVALID_AUTH_FIELD, erroringField);
		} else {
			// Only other error is it's already linked, meaning the UNIQUE rule from the raspberry
			// is NOT respected
			req.flashError(FlashMessages.ALREADY_LINKED);
		}
	} finally {
		return res.redirect('/profil/add-raspberry');
	}
}
