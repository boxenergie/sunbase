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

import logger from '../../utils/logger';
import User from '../../models/User';

export async function renderProfilPage(req: Request, res: Response, next: NextFunction) {
	// GET ?rmUser=...
	if (req.query.rmUser)
		return removePermission(req, res, next);

	const permissions = await req.user!.permissions.resolveForDisplay();

	res.render('profil', {
		csrfToken	: req.csrfToken(),
		errorMsg	: req.flash('error'),
		successMsg	: req.flash('success'),
		permissions	: permissions,
	});
}

export async function changeUsername(req: Request, res: Response, _: NextFunction) {
	const succeed 	= (msg: string) => req.flash('success', msg);
	const error 	= (msg: string) => req.flash('error', msg);

	if (!req.body.pwd || !req.body.new_username)
		error('One or more fields were not provided.');
	else if (!await req.user?.comparePassword(req.body.pwd))
		error('Wrong password');
	else {
		try {
			const oldUsername = req.user!.username;

			req.user!.username = req.body.new_username;
			await req.user!.save();

			logger.info(`'${oldUsername}' changed his username to '${req.body.new_username}'`);
			succeed('Username changed.');
		} catch (err) {
			error('Username already exists.');
		}
	}

	res.redirect('/profil');
}

export async function changePassword(req: Request, res: Response, _: NextFunction) {
	const error = (msg: string) => req.flash('error', msg);

	if (!req.body.old_pwd || !req.body.new_pwd || !req.body.new_pwd_confirm)
		error('One or more fields were not provided.');
	else if (req.body.new_pwd !== req.body.new_pwd_confirm)
		error('New passwords must match.');
	else if (!await req.user?.comparePassword(req.body.old_pwd))
		error('Wrong password.');
	else {
		// Save password
		req.user!.password = req.body.new_pwd;
		await req.user!.save();

		// Disconnect the user from all devices...
		// ...but not the one used to change the password
		// ...this is handled automatically by express-session
		await req.user!.disconnectFromAllDevices();

		logger.info(`'${req.user!.username}' changed his password`);
		req.flash('success', 'Password changed.');
	}

	res.redirect('/profil');
}

export async function grantPermission(req: Request, res: Response, _: NextFunction) {
	const error = (msg: string) => req.flash('error', msg);

	if (!req.body.grantee)
		error('Please enter a username.');
	else {
		const grantee = await User.Model.findOne({ username: req.body.grantee });

		if (!grantee)
			error('Unknown user.');
		else if(grantee.id === req.user!.id)
			error('You cannot grant a permission to yourself.');
		else {
			await req.user!.grantPermissionTo(grantee!, req.body.permission);

			logger.info(`'${req.user!.username}' granted the permission '${req.body.permission}' to '${grantee.username}'`);
			req.flash('success', `Granted permission '${req.body.permission}' to '${grantee.username}'.`);
		}
	}

	res.redirect('/profil');
}

export async function removePermission(req: Request, res: Response, _: NextFunction) {
	const error = (msg: string) => req.flash('error', msg);

	const deletedPermissionType 	= req.query.rmPerm;
	const deletedPermissionGrantee 	= sanitize(req.query.rmUser);
	const deletedPermissionUser 	= await User.Model.findOne({ username: deletedPermissionGrantee });

	if (!deletedPermissionType || !deletedPermissionGrantee)
		error(`One or more fields were not provided.`);
	else if (!deletedPermissionUser)
		error(`Unknown user: '${deletedPermissionGrantee}'.`);
	else {
		await req.user!.revokePermissionFrom(deletedPermissionUser!, deletedPermissionType);

		logger.info(`'${req.user!.username}' revoked the permission '${deletedPermissionType}' to '${deletedPermissionUser.username}'`);
		req.flash('success', `Revoked permission '${deletedPermissionType}' to '${deletedPermissionGrantee}'.`);
	}

	res.redirect('/profil');
}


