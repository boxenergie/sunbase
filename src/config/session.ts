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

import { Router } from 'express';
import expressSession, { SessionOptions } from 'express-session';
const MongoStore = require('connect-mongo')(expressSession);

import MongoClient from '../db/mongodb';

const R = Router();

const session: SessionOptions = {
	// @ts-ignore -- We know SESSION_SECRET is not undefined thanks to dotenv-safe
	secret: process.env.SESSION_SECRET,
	name: 'session.token',
	store: new MongoStore({ mongooseConnection: MongoClient }),
	cookie: {
		maxAge: 3600 * 24 /* * day */ * 1000 /* 1 day */,
		httpOnly: true,
		path: '/',
		secure: 'auto',
		sameSite: true,
	},
	resave: true,
	saveUninitialized: false,
};

R.use(expressSession(session));

export default R;
