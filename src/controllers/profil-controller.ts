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

import { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

import logger from '../utils/logger';
import User from '../models/User';
import FlashMessages from "./flash-messages";

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
		const oldUsername:string = req.user!.username;
		const newUsername:string = req.body.new_username;
		const checkPassword:string = req.body.pwd;
		const error = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('errorMsg', msg, ...params);
		const succeed = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('successMsg', msg, ...params);

		if (!checkPassword || !newUsername) {
			error(FlashMessages.MISSING_FIELD);
		} else if (!req.user?.comparePassword(checkPassword)) {
			error(FlashMessages.WRONG_PASSWORD);
		} else {
			try {
				if (req.user!.role === 'raspberry') {
					req.user!.username = req.user!.username.replace(/\/.*/, `/${req.body.new_username}`);
					req.user!.raspberry!.label = req.body.new_username;
				} else {
					req.user!.username = req.body.new_username;
				}
				await req.user!.save();

				// If it suceeds, change the name of all of his raspberries
				const raspberries = await User.find({ username: new RegExp(`^${req.user!.username}/.+`) });
				
				for (const r of raspberries) {
					r.username = r.username.replace(oldUsername, newUsername);
					await r.save();
				}

				succeed(FlashMessages.USERNAME_CHANGED);
			} catch (err) {
				error(FlashMessages.USERNAME_EXISTS);
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
		const oldPassword = sanitize(req.body.old_pwd);
		const newPassword = req.body.new_pwd;
		const checkNewPassword = req.body.new_pwd_confirm;
		let errorMsg: FlashMessages|null = null;

		if (!oldPassword || !newPassword || !checkNewPassword)
			errorMsg = FlashMessages.MISSING_FIELD;
		else if (newPassword !== checkNewPassword)
			errorMsg = FlashMessages.MISMATCHING_PASSWORDS;
		else if (!req.user?.comparePassword(oldPassword))
			errorMsg = FlashMessages.WRONG_PASSWORD;

		if (errorMsg) {
			req.flashLocalized('errorMsg', errorMsg);
			return res.redirect('/profil');
		}

		// Save password
		req.user!.password = req.body.new_pwd;
		await req.user!.save();

		// Disconnect the user from all devices...
		req.user!.disconnectFromAllDevices(err => {
			// ...but not the one used to change the password
			// ...this is handled automatically by express-session
			req.flashLocalized('successMsg', FlashMessages.PASSWORD_CHANGED);
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
		let  errorMsg: FlashMessages|null = null;

		if (!granteeName)
			errorMsg = FlashMessages.MISSING_USERNAME;
		let grantee = await User.findOne({ username: granteeName });

		if (!grantee)
			errorMsg = FlashMessages.USER_NOT_FOUND;
		else if(grantee.id === req.user!.id)
			errorMsg = FlashMessages.SELF_PERMISSION;

		if (errorMsg) {
			req.flashLocalized('errorMsg', errorMsg);
		} else {
			await req.user!.grantPermissionTo(grantee!, permissionType);
			req.flashLocalized('successMsg', FlashMessages.PERMISSION_GRANTED);
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
		const granteeName = sanitize(req.query.rmUser as string|undefined);
		const granterName = sanitize(req.query.rmGranter as string|undefined);
		const permissionGranter = granterName ? await User.findOne({ username: sanitize(req.query.rmGranter) as string }) : req.user;
		const permissionGrantee = granteeName ? await User.findOne({ username: sanitize(req.query.rmUser) as string }) : req.user;

		if (!deletedPermissionType || !(granteeName || granterName) || (req.user !== permissionGrantee && req.user !== permissionGranter)) {
			req.flashLocalized('errorMsg', FlashMessages.REVOCATION_ERROR, deletedPermissionType, granterName || "<???>", granteeName || "<???>");
		} else if (!permissionGrantee) {
			req.flashLocalized('errorMsg', FlashMessages.USER_NOT_FOUND, granteeName || "<???>")
		} else if (!permissionGranter) {
			req.flashLocalized('errorMsg', FlashMessages.USER_NOT_FOUND, granterName || "<???>");
		} else {
			await permissionGranter!.revokePermissionFrom(permissionGrantee!, deletedPermissionType as any);
			req.flashLocalized(
				'successMsg',
				granteeName && FlashMessages.PERMISSION_REVOKED || FlashMessages.SELF_PERMISSION_REVOKED,
				deletedPermissionType, granteeName || ""
			);
		}
		return res.redirect('/profil');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Someting went wrong');
	}
}


