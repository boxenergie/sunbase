/*
 * auth-controller.ts
 * Copyright (C) Sunshare 2019
 * This file is part of Sunbase.
 * Sunbase is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * Sunbase is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with Sunbase. If not, see <http://www.gnu.org/licenses/>.
 */

import * as Sqrl from 'squirrelly';
import { NextFunction, Response, Request } from 'express';

export function renderLoginPage(req: Request, res: Response, next: NextFunction) {
	try {
		res.send(Sqrl.renderFile('./views/loginpage.squirrelly', {}));
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}

export function logOut(req: Request, res: Response, next: NextFunction) {
	req.logout();
	req.session?.destroy((err) => {
        if (!err) {
            res.clearCookie('connect.sid', {path: '/'}).redirect('/');
        } else {
			console.log(err);
            res.send('Impossible to logout, please contact an admin');
        }
    });
}
