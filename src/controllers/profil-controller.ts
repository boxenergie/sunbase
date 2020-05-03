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
import sanitize from 'mongo-sanitize';

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
			user: req.user,
			permissions,
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function changeUsername(req: Request, res: Response, next: NextFunction) {
	try {
		const user = req.user!;
		const oldUsername:string = user.username;
		const newUsername:string = req.body.username;
		const checkPassword:string = req.body.password;
		const error = (msg: string) => req.flash('errorMsg', msg);
		const succeed = (msg: string) => req.flash('successMsg', msg);

		if (!checkPassword || !newUsername) {
			error('One or more fields were not provided.');
		} else if (!req.user?.comparePassword(checkPassword)) {
			error('Wrong password');
		} else {
			try {
				if (user.role === 'raspberry') {
					user.username = oldUsername.replace(/\/.*/, `/${newUsername}`);
					user.raspberry!.label = newUsername;
				} else {
					user.username = newUsername;
				}
				await user.save();

				// If it succeeds, change the name of all of his raspberries
				const raspberries = await User.find({ username: new RegExp(`^${oldUsername}/.+`) });
				
				for (const r of raspberries) {
					r.username = r.username.replace(oldUsername, newUsername);
					await r.save();
				}

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
		const passwords = req.body.password;
		const oldPassword = passwords && sanitize(passwords[0]);
		const newPassword = passwords && passwords[1];
		const checkNewPassword = passwords && passwords[2];
		let errorMsg = null;

		if (!oldPassword || !newPassword || !checkNewPassword)
			errorMsg = 'One or more fields were not provided.';
		else if (newPassword !== checkNewPassword)
			errorMsg = 'New passwords must match.';
		else if (!req.user?.comparePassword(oldPassword))
			errorMsg = 'Wrong password.';

		if (errorMsg) {
			req.flash('errorMsg', errorMsg);
			return res.redirect('/profil');
		}

		// Save password
		req.user!.password = newPassword;
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
		const granteeName = sanitize(req.body.grantee);
		const permissionType = sanitize(req.body.permission);
		let  errorMsg = null;

		if (!granteeName)
			errorMsg = 'Please enter a username';
		let grantee = await User.findOne({ username: granteeName });

		if (!grantee)
			errorMsg = 'Unknown user';
		else if(grantee.id === req.user!.id)
			errorMsg = 'You cannot grant a permission to yourself.';

		if (errorMsg) {
			req.flash('errorMsg', errorMsg);
		} else {
			await req.user!.grantPermissionTo(grantee!, permissionType);
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
		const deletedPermissionType = sanitize(req.query.rmPerm);
		const granteeName = sanitize(req.query.rmUser);
		const granterName = sanitize(req.query.rmGranter);
		const permissionGranter = granterName ? await User.findOne({ username: sanitize(req.query.rmGranter) as string }) : req.user;
		const permissionGrantee = granteeName ? await User.findOne({ username: sanitize(req.query.rmUser) as string }) : req.user;

		if (!deletedPermissionType || !(granteeName || granterName) || (req.user !== permissionGrantee && req.user !== permissionGranter))
			errorMsg = `Error while deleting permission:${deletedPermissionType} from: ${granterName} to:${granteeName}`;
		else if (!permissionGrantee)
			errorMsg = `Unknown user: ${granteeName}`;
		else if (!permissionGranter)
			errorMsg = `Unknown user: ${granterName}`

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


