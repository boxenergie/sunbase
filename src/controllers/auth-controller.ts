/*
 * auth-controller.ts
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

import { NextFunction, Response, Request } from 'express';

import logger from '../utils/logger';

export function renderLoginPage(req: Request, res: Response, next: NextFunction) {
	res.render('login', {
		csrfToken: req.csrfToken(),
		errorMsg : req.flash('errorMsg'),
	});
}

export function logOut(req: Request, res: Response, next: NextFunction) {
	req.logout();
	req.session?.destroy((err) => {
		if (err) {
			logger.error(err.message);
			res.status(500).send('Impossible to logout, please contact an admin');
		}
		else {
			res.clearCookie('connect.sid', { path: '/' }).redirect('/');
		}
	});
}
