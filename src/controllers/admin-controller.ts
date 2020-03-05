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

	try {
		const users = await User.find().limit(10).exec();
		res.render('admin-page', {
			users: users,
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
		let errorMsg = null;
		const deletedUserId = req.query.deleted;

		if (!deletedUserId) {
			errorMsg = 'One or more fields were not provided.';
		}        

		try {
			await User.deleteOne({ _id: sanitize(deletedUserId) });
			req.flash('successMsg', 'User deleted.');
			return res.redirect('/admin');
		} catch (err) {
			req.flash('errorMsg', errorMsg ?? 'Username did not exist.');
			return res.redirect('/admin');
		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
