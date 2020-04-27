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
import User from '../models/User';

export async function renderProfilPage(req: Request, res: Response, next: NextFunction) {

	if (req.query.rmPerm) {
		return removePermission(req, res, next);
	}
	try {
		const permissions = await req.user!.permissions.resolveForDisplay();

		res.render('profil', {
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
				if (req.user!.role === 'raspberry') {
					req.user!.username = req.user!.username.replace(/\/.*/, `/${req.body.new_username}`);
					req.user!.raspberry!.label = req.body.new_username;
				} else {
					req.user!.username = req.body.new_username;
				}
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

export async function grantPermission(req: Request, res: Response, next: NextFunction) {
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
		} else {
			await req.user!.grantPermissionTo(grantee!, req.body.permission);
			req.flash('successMsg', 'Permission granted.');
		}
		return res.redirect('/profil');

	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Someting went wrong');
	}
}

export async function removePermission(req: Request, res: Response, next: NextFunction) {
	try {
		let errorMsg = null;
		const deletedPermissionType = req.query.rmPerm;
		const granteeName = req.query.rmUser;
		const granterName = req.query.rmGranter;
		const permissionGranter = granterName ? await User.findOne({ username: req.query.rmGranter as string }) : req.user;
		const permissionGrantee = granteeName ? await User.findOne({ username: req.query.rmUser as string }) : req.user;

		if (!deletedPermissionType || !(granteeName || granterName) || (req.user !== permissionGrantee && req.user !== permissionGranter)) {
			errorMsg = `Error while deleting permission:${deletedPermissionType} from: ${granterName} to:${granteeName}`;
		}
		if (!permissionGrantee) {
			errorMsg = `Unknown user: ${granteeName}`;
		}
		if (!permissionGranter) {
			errorMsg = `Unknown user: ${granterName}`
		}

		if (errorMsg) {
			req.flash('errorMsg', errorMsg);
		} else {
			await permissionGranter!.revokePermissionFrom(permissionGrantee!, deletedPermissionType as any);
			req.flash('successMsg', 'Remove permission ' + deletedPermissionType + ' to ' + (granteeName || 'myself'));
		}
		return res.redirect('/profil');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Someting went wrong');
	}
}


