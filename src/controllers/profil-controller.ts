/*
 * profil-controller.ts
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

export function renderProfilPage(req: Request, res: Response, next: NextFunction) {
	try {
		res.render('profil-page', {
			csrfToken: req.csrfToken(),
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
		});
	} catch (err) {
		logger.error(err);
		res.status(500).send('Something went wrong');
	}
}

export async function changeUsername(req: Request, res: Response, next: NextFunction) {
	try {
		let errorMsg = null;

		if (!req.body.pwd || !req.body.new_username)
			errorMsg = 'One or more fields were not provided.';
		else if (!req.user?.comparePassword(req.body.pwd))
			errorMsg = 'Wrong password';
		
		try {
			if (errorMsg){
				throw errorMsg;
			}
			req.user!.username = req.body.new_username;
			await req.user!.save();

			req.flash('successMsg', 'Username changed.');
			return res.redirect('/profil');
		} catch {
			req.flash('errorMsg', errorMsg ?? 'Username already exists.');
			return res.redirect('/profil');
		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
	try {
		let errorMsg = null;

		if (!req.body.old_pwd || !req.body.new_pwd || !req.body.new_pwd_confirm)
			errorMsg = 'One or more fields were not provided.';
		else if (req.body.new_pwd !== req.body.new_pwd_confirm)
			errorMsg = 'New passwords must match.';
		if (!req.user?.comparePassword(req.body.old_pwd))
			errorMsg = 'Wrong password.';

		if (errorMsg) {
			req.flash('errorMsg', errorMsg);
			return res.redirect('/profil');
		}

		// Save password
		req.user!.password = req.body.new_pwd;
		await req.user!.save();

		// Disconnect the user from all devices...
		req.user!.disconnectFromAllDevices(err => {
			// ...but not the one used to change the password
			// ...this is handled automatically by express-session
			req.flash('successMsg', 'Password changed.');
			res.redirect('/profil');
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
