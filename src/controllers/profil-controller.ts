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
import {models, Types} from 'mongoose';

import logger from '../utils/logger';
import User, { UserDocument } from '../models/User';
import sanitize from "@types/mongo-sanitize";

export async function renderProfilPage(req: Request, res: Response, next: NextFunction) {

	if (req.query.rmUser) {
		logger.debug('remove perm');
		return removePermission(req, res, next);
	}
	try {
		const permissions = await req.user!.permissions.resolveForDisplay();

		res.render('profil-page', {
			csrfToken: req.csrfToken(),
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
			permissions,
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function changeUsername(req: Request, res: Response, next: NextFunction) {
	try {
		const error = (msg: string) => req.flash('errorMsg', msg);
		const succeed = (msg: string) => req.flash('successMsg', msg);

		if (!req.body.pwd || !req.body.new_username) {
			error('One or more fields were not provided.');
		} else if (!req.user?.comparePassword(req.body.pwd)) {
			error('Wrong password');
		} else {
			try {
				req.user!.username = req.body.new_username;
				await req.user!.save();

				succeed('Username changed.');
			} catch (err) {
				error('Username already exists.');
			}
		}
		return res.redirect('/profil');

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

async function grantPermission(req: Request, res: Response, next: NextFunction) {
	try{
		let  errorMsg = null;

		if (!req.body.grantee)
			errorMsg = 'Please enter a username';
		let grantee = await User.findOne({ username: req.body.grantee });
		if (!grantee)
			errorMsg = 'Unknown user';
		else if(grantee.id === req.user!.id)
			errorMsg = 'You cannot grant a permission to yourself.';
		if (errorMsg) {
			req.flash('errorMsg', errorMsg);
			return res.redirect('/profil');
		} else {
			req.user!.grantPermissionTo(grantee!, req.body.permission);
			req.flash('successMsg', 'Permission granted.');
			return res.redirect('/profil');

		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Someting went wrong');
	}
}

export async function removePermission(req: Request, res: Response, next: NextFunction) {
	let errorMsg = null;
	const deletedPermissionId = req.query.rmPerm;
	logger.info(req.user!.permissions.granting);
	logger.info(req.query.rmPerm);
	logger.info(req.query.rmUser);
	//const granteePermission = await req.user!.permissions
/*
	try {
		if (errorMsg) {
			req.flash('errorMsg', errorMsg);
			return res.redirect('/profil');
		} else {

		}

		await User.deleteOne({ _id: sanitize(deletedUserId) });
		req.flash('successMsg', 'User deleted.');
		return res.redirect('/admin');
	} catch (err) {
		req.flash('errorMsg', errorMsg ?? 'Username did not exist.');
		return res.redirect('/admin');
	}*/
}

export async function updatePermission(req: Request, res: Response, next: NextFunction) {
	try {
		logger.debug(req.query.rmUser);
		logger.debug(req.query.rmPerm);
		if (req.query.rmUser){
			logger.debug('remove perm');
			return removePermission(req, res, next);
		} else {
			logger.debug('add perm');
			return grantPermission(req, res, next);
		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Someting went wrong');
	}
}
