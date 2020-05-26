/*
 * profil-controller.ts
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

import User from '../models/User';
import FlashMessages from '../utils/flash-messages';
import logger from '../utils/logger';

export async function renderProfilPage(req: Request, res: Response, next: NextFunction) {
	if (req.query.rmPerm) {
		return removePermission(req, res, next);
	}

	const permissions = await req.user!.permissions.resolveForDisplay();

	res.render('profil', {
		csrfToken : req.csrfToken(),
		errorMsg  : req.flash('errorMsg'),
		successMsg: req.flash('successMsg'),
		user      : req.user,
		permissions,
	});
}

export async function changeEmail(req: Request, res: Response, next: NextFunction) {
	const user                  = req.user!;
	const newEmail: string      = sanitize(req.body.email);
	const checkPassword: string = sanitize(req.body.password);

	if (!checkPassword || !newEmail) {
		req.flashError(FlashMessages.MISSING_FIELD);
	}
	else if (!req.user?.comparePassword(checkPassword)) {
		req.flashError(FlashMessages.WRONG_PASSWORD);
	}
	else {
		try {
			// Raspberries don't have email, therefore are not allowed to change it
			if (user.role === 'raspberry') return res.redirect('/profil');

			user.email = newEmail;
			await user.save();

			logger.info(`User '${user.username}' changed his email to '${newEmail}'.`);

			req.flashSuccess(FlashMessages.EMAIL_CHANGED);
		} catch (err) {
			req.flashError(FlashMessages.EMAIL_EXISTS);
		}
	}
	return res.redirect('/profil');
}

export async function changeUsername(req: Request, res: Response, next: NextFunction) {
	const user                  = req.user!;
	const oldUsername: string   = user.username;
	const newUsername: string   = sanitize(req.body.username);
	const checkPassword: string = sanitize(req.body.password);

	if (!checkPassword || !newUsername) {
		req.flashError(FlashMessages.MISSING_FIELD);
	}
	else if (!req.user?.comparePassword(checkPassword)) {
		req.flashError(FlashMessages.WRONG_PASSWORD);
	}
	else {
		try {
			// Raspberry can only change their label part
			if (user.role === 'raspberry') {
				user.username         = oldUsername.replace(/\/.*/, `/${newUsername}`);
				user.raspberry!.label = newUsername;
			}
			else {
				user.username = newUsername;
			}
			await user.save();

			logger.info(`User '${oldUsername}' changed his email to '${newUsername}'.`);
			
			// If it succeeds, change the name of all of his raspberries
			const raspberries = await User.find({ username: new RegExp(`^${oldUsername}/.+`) });

			for (const r of raspberries) {
				r.username = r.username.replace(oldUsername, newUsername);
				await r.save();
			}
			logger.debug('Changed the name of all associated raspberries.');

			req.flashSuccess(FlashMessages.USERNAME_CHANGED);
		} catch (err) {
			req.flashError(FlashMessages.USERNAME_EXISTS);
		}
	}
	return res.redirect('/profil');
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
	const oldPassword                    = sanitize(req.body.old_pwd);
	const newPassword                    = sanitize(req.body.new_pwd);
	const checkNewPassword               = sanitize(req.body.new_pwd_confirm);
	let   errorMsg: FlashMessages | null = null;

	if (!oldPassword || !newPassword || !checkNewPassword) errorMsg = FlashMessages.MISSING_FIELD;
	else if (newPassword !== checkNewPassword) errorMsg = FlashMessages.MISMATCHING_PASSWORDS;
	else if (!req.user?.comparePassword(oldPassword)) errorMsg = FlashMessages.WRONG_PASSWORD;

	if (errorMsg) {
		req.flashError(errorMsg);
		return res.redirect('/profil');
	}

	// Save password
	req.user!.password = newPassword;
	await req.user!.save();

	logger.info(`User '${req.user!.username}' changed his password.`);

	// Disconnect the user from all devices...
	req.user!.disconnectFromAllDevices((err) => {
		// ...but not the one used to change the password
		// ...this is handled automatically by express-session
		req.flashSuccess(FlashMessages.PASSWORD_CHANGED);
		res.redirect('/profil');
	});
}

export async function grantPermission(req: Request, res: Response, next: NextFunction) {
	const granteeName                    = sanitize(req.body.grantee);
	const permissionType                 = sanitize(req.body.permission);
	let   errorMsg: FlashMessages | null = null;
	let   errorParams: string[]          = [];

	if  (!granteeName) errorMsg = FlashMessages.MISSING_USERNAME;
	let grantee                 = await User.findOne({ username: granteeName });

	if (!grantee) {
		errorMsg    = FlashMessages.USER_NOT_FOUND;
		errorParams = [granteeName];
	}
	else if (grantee.id === req.user!.id) errorMsg = FlashMessages.SELF_PERMISSION;

	if (errorMsg) {
		req.flashError(errorMsg, ...errorParams);
	} else {
		await req.user!.grantPermissionTo(grantee!, permissionType);

		logger.info(`User '${req.user!.username}' granted permission '${permissionType}' to '${granteeName}'.`);
		req.flashSuccess(FlashMessages.PERMISSION_GRANTED);
	}

	return res.redirect('/profil');
}

export async function removePermission(req: Request, res: Response, next: NextFunction) {
	const deletedPermissionType = sanitize(req.query.rmPerm as string | undefined);
	const granteeName           = sanitize(req.query.rmUser as string | undefined);
	const granterName           = sanitize(req.query.rmGranter as string | undefined);
	
	const permissionGranter     = granterName
		? await User.findOne({ username: sanitize(req.query.rmGranter) as string })
		: req.user;
	const permissionGrantee = granteeName
		? await User.findOne({ username: sanitize(req.query.rmUser) as string })
		: req.user;

	if (
		!deletedPermissionType ||
		!(granteeName || granterName) ||
		(req.user !== permissionGrantee && req.user !== permissionGranter)
	) {
		req.flashError(
			FlashMessages.REVOCATION_ERROR,
			deletedPermissionType || '<???>',
			granterName || '<???>',
			granteeName || '<???>'
		);
	}
	else if (!permissionGrantee) {
		req.flashError(FlashMessages.USER_NOT_FOUND, granteeName || '<???>');
	}
	else if (!permissionGranter) {
		req.flashError(FlashMessages.USER_NOT_FOUND, granterName || '<???>');
	}
	else {
		await permissionGranter!.revokePermissionFrom(
			permissionGrantee!,
			deletedPermissionType as any
		);

		logger.info(
			`User '${req.user!.username}' revoked permission '${deletedPermissionType}' to '${granteeName}'.`
		);
		req.flashSuccess(
			(granteeName && FlashMessages.PERMISSION_REVOKED) ||
				FlashMessages.SELF_PERMISSION_REVOKED,
			deletedPermissionType,
			granteeName || ''
		);
	}
	return res.redirect('/profil');
}
