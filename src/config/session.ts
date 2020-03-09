/*
 * session.ts
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

import { Express } from 'express';
import expressSession from 'express-session';

const MongoStore = require('connect-mongo')(expressSession);

import MongoClient from '../db/mongodb';

export default (app: Express) => {
	const session = {
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
		cookie: { secure: false },
		store: new MongoStore({ mongooseConnection: MongoClient })
	};

	if (app.get('env') === 'production') {
		app.set('trust proxy', 1);
		session.cookie.secure = true;
	}

	// @ts-ignore
	app.use(expressSession(session));
}
