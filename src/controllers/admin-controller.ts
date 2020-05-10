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

import { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

import User from '../models/User';
import logger from '../utils/logger';
import FlashMessages from "../utils/flash-messages";

export async function renderAdminPage(req: Request, res: Response, next: NextFunction) {
	if (req.query.deleted) {
		return deleteUser(req, res, next);
	}

	const elementPerPage: number = Number(req.query.displayLimit) || 10;
	let page: number = Number(req.query.page) ?? 1;

	// Count number of users
	const count = await User.countDocuments({});

	// If there are less users (excluding current user) than the limit, force page to 1
	if ((count - 1) < elementPerPage)
		page = 1;

	try {
		const users = await User.find({ _id: { $ne: req.user!._id } })
			.skip((page - 1) * elementPerPage)
			.limit(elementPerPage);
		res.render('admin', {
			users: users,
			nPages: Math.ceil(count / elementPerPage),
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
	try {
		const deletedUserId = sanitize(req.query.deleted);
		const error = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('errorMsg', msg, ...params);
		const succeed = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('successMsg', msg, ...params);

		if (deletedUserId === req.user!.id) {
			error(FlashMessages.SELF_DELETION);
		} else {
			try {
				const user = await User.findById(deletedUserId);

				await User.findOneAndDelete({ _id: deletedUserId });
				logger.info(`User '${user!.username}' (${deletedUserId}) deleted by admin.`);

				if (['user', 'admin'].includes(user!.role)) {
					const usernameRegex = new RegExp(`${user!.username}\/.+`);
					const userRaspberries = await User.find({ username: { $regex: usernameRegex }});

					for (const u of userRaspberries) {
						await User.findOneAndDelete({ _id: u._id });
						logger.info(`User '${u.username}' (${u._id}) deleted by admin.`);
					}
				}

				succeed(FlashMessages.USER_DELETED);
			} catch (err) {
				error(FlashMessages.USER_NOT_FOUND);
			}
		}

		return res.redirect('/admin');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
