/*
 * register-controller.ts
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

import { Request, Response, NextFunction } from 'express';
import Q from 'q';
import sanitize from 'mongo-sanitize';

import logger from '../utils/logger';
import User from '../models/User';
import FlashMessages from '../utils/flash-messages';

export async function renderRegisterPage(req: Request, res: Response, _: NextFunction) {
	res.render('register', {
		csrfToken: req.csrfToken(),
		errorMsg : req.flash('errorMsg'),
	});
}

export async function registerUser(req: Request, res: Response, _: NextFunction) {
	const email: string    = sanitize(req.body.email);
	const username: string = sanitize(req.body.username);
	const password: string = sanitize(req.body.password);

	try {
		const user = await User.create({
			email   : email,
			username: username,
			password: password,
		});
		logger.info(`New user: ${username} (${email})`);

		const P = Q.defer();
		req.login(user, (err) => {
			if (!err) P.resolve();
			else P.reject(err);
		});
		await P.promise;

		res.redirect('/');
	} catch (err) {
		// MongoError occurs when creating a user with an already existing username / mail
		if (err.name === 'MongoError') {
			logger.debug(err.message);

			req.flashError(FlashMessages.UNAVAILABLE_CREDENTIALS);
			res.redirect('/register');
		}
		// ValidationError occurs when the validation rules from the Mongoose Schema are not
		// respected
		else if (err.name === 'ValidationError') {
			logger.debug(err.message);

			const invalidField = err.errors[Object.keys(err.errors)[0]].path;
			req.flashError(FlashMessages.INVALID_AUTH_FIELD, invalidField);
			res.redirect('/register');
		}
		// Any other errors is when something went wrong
		else {
			throw err;
		}
	}
}
