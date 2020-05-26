/*
 * admin-controller.ts
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
import logger from '../utils/logger';
import FlashMessages from '../utils/flash-messages';

export async function renderAdminPage(req: Request, res: Response, next: NextFunction) {
	if (req.query.deleted) {
		return deleteUser(req, res, next);
	}

	const elementPerPage: number = Number(req.query.displayLimit) || 10;
	let   page: number           = Number(req.query.page) ?? 1;

	// Count number of users
	const count = await User.countDocuments();

	// If there are less users (excluding current user) than the limit, force page to 1
	if (count - 1 < elementPerPage) page = 1;

	// Find all users but the current one
	const users = await User.find({ _id: { $ne: req.user!._id } })
		.skip((page - 1) * elementPerPage)
		.limit(elementPerPage);

	res.render('admin', {
		users     : users,
		nPages    : Math.ceil(count / elementPerPage),
		errorMsg  : req.flash('errorMsg'),
		successMsg: req.flash('successMsg'),
	});
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
	const deletedUserId = sanitize(req.query.deleted);

	if (deletedUserId === req.user!.id) {
		req.flashError(FlashMessages.SELF_DELETION);
	}
	else {
		try {
			const user = await User.findById(deletedUserId);

			await User.findOneAndDelete({ _id: deletedUserId });
			logger.info(`User '${user!.username}' (${deletedUserId}) deleted by admin.`);

			// Cascade delete of the user's raspberry
			if (['user', 'admin'].includes(user!.role)) {
				const usernameRegex = new RegExp(`${user!.username}\/.+`);
				const userRaspberries = await User.find({
					username: { $regex: usernameRegex },
				});

				for (const u of userRaspberries) {
					await User.findOneAndDelete({ _id: u._id });
					logger.info(`User '${u.username}' (${u._id}) deleted by admin.`);
				}
			}
			logger.debug('Deleted all associated raspberries.');

			req.flashSuccess(FlashMessages.USER_DELETED);
		} catch (err) {
			req.flashError(FlashMessages.USER_NOT_FOUND, '<???>');
		}
	}

	return res.redirect('/admin');
}
