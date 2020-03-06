/*
 * auth.ts
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

import { NextFunction, Response, Request, RequestHandler } from 'express';

type OptionalRedirect = {
    failureRedirect?: string;
}

/**
 * This function provides a middleware to prevent non-logged in user to access
 * certain data.
 * How to use :
 *  - app.get('/', isLoggedIn(), ...);
 *  - app.get('/', isLoggedIn({ failureRedirect: '/' }), ...);
 * @param opt Where to redirect the user if he isn't logged in, default is '/login'
 */
export function isLoggedIn(opt: OptionalRedirect = {}): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.isAuthenticated()) return next();

		res.redirect(opt.failureRedirect ?? '/login');
	};
}

/**
 * This function provides a middleware to prevent logged in user to access
 * certain data.
 * How to use :
 *  - app.get('/', isNotLoggedIn(), ...);
 *  - app.get('/', isNotLoggedIn({ failureRedirect: '/' }), ...);
 * @param opt Where to redirect the user if he is logged in, default is '/'
 */
export function isNotLoggedIn(opt: OptionalRedirect = {}): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.isAuthenticated()) return next();

		res.redirect(opt.failureRedirect ?? '/');
	};
}

/**
 * This function provides a middleware to prevent non-admin user to access
 * certain data. Additionally, it will also check if the user is logged in.
 * How to use :
 *  - app.get('/', isAdmin(), ...);
 *  - app.get('/', isAdmin({ failureRedirect: '/' }), ...);
 * @param opt Where to redirect the user if he isn't admin, default is '/login'
 */
export function isAdmin(opt: OptionalRedirect = {}): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.isAuthenticated() && req.user?.role == 'admin') return next();

		res.redirect(opt.failureRedirect ?? '/login');
	};
}
