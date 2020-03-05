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

import User from '../models/User';
import logger from '../utils/logger';

export async function renderAdminPage(req: Request, res: Response, next: NextFunction) {
	if (req.query.deleted) {
		return deleteUser(req, res, next);
	}

	const elementPerPage: number = Number(req.query.displayLimit) ?? 10;
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
		res.render('admin-page', {
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
		const deletedUserId = req.query.deleted;
		const error = (msg: string) => req.flash('errorMsg', msg);
		const succeed = (msg: string) => req.flash('successMsg', msg);

		if (deletedUserId === req.user!.id){
			error('You cannot delete yourself.');
		} else {
			try {
				await User.deleteOne({_id: sanitize(deletedUserId)});
				succeed('User deleted.');
			} catch (err) {
				error('Username did not exist');
			}
		}

		return res.redirect('/admin');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
