/*
 * admin-controller.ts
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
import { Types } from 'mongoose';

import logger from '../../utils/logger';
import User from '../../models/User';

export async function renderAdminPage(req: Request, res: Response, next: NextFunction) {
	// GET ?deleted=...
	if (req.query.deleted)
		return deleteUser(req, res, next);

	let page 				= Number(req.query.page) || 1;
	const elementPerPage 	= Number(req.query.displayLimit) || 10;
	const count 			= await User.Model.countDocuments({});

	// If there are less users (excluding current user) than the limit, force page to 1
	if ((count - 1) < elementPerPage)
		page = 1;

	const users = await User.Model.find({ _id: { $ne: req.user!._id } })
		.skip((page - 1) * elementPerPage)
		.limit(elementPerPage);

	res.render('admin', {
		users		: users,
		nPages		: Math.ceil(count / elementPerPage),
		errorMsg	: req.flash('error'),
		successMsg	: req.flash('success'),
	});
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
	const deletedUserId = sanitize(req.query.deleted);
	const succeed 		= (msg: string) => req.flash('success', msg);
	const error 		= (msg: string) => req.flash('error', msg);

	if (deletedUserId === req.user!.id)
		error('You cannot delete yourself.');
	else if (!Types.ObjectId.isValid(deletedUserId)) {
		error('Username did not exist.');
	}
	else {
		try {
			await User.Model.deleteOne({ _id: deletedUserId }).orFail();

			logger.info(`User with ID '${deletedUserId}' is now deleted`);
			succeed('User deleted.');
		}
		catch (err) {
			error('Username did not exist.');
		}
	}

	res.redirect('/admin');
}
