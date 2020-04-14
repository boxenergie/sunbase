/*
 * register-controller.ts
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

import { Request, Response, NextFunction } from 'express';
import Q from 'q';
import sanitize from 'mongo-sanitize';

import logger from '../utils/logger';
import User from '../models/User';

export async function renderRegisterPage(req: Request, res: Response, _: NextFunction) {
	res.render('register', {
		csrfToken	: req.csrfToken(),
		errorMsg	: req.flash('error')
	});
}

export async function registerUser(req: Request, res: Response, _: NextFunction) {
	try {
		const username:string = sanitize(req.body.username);
		const password:string = sanitize(req.body.password);

		try {
			const user = await User.create({
				username: username,
				password: password,
			});
			logger.info(`New user: ${username}`);

			const P = Q.defer();
			req.login(user, err => {
				if (!err) P.resolve();
				else P.reject(err);
			});
			await P.promise;

			res.redirect('/');
		}
		catch (err) {
			if (err.name === 'MongoError') {
				logger.debug(err.message);

				req.flash('error', `Username '${username}' is not available.`);
				res.redirect('/register');
			}
			else if (err.name === 'ValidationError') {
				logger.debug(err.message);

				req.flash('error',
					`Please respect the rules for the ${err.errors[Object.keys(err.errors)[0]].path} field.`
				);
				res.redirect('/register');
			}
			else {
				throw err;
			}
		}
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
