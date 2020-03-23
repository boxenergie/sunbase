/*
 * index.ts
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

import { Request, Response, NextFunction, Router } from 'express';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import csrf from 'csurf';
import flash from 'connect-flash';

import logger from '../utils/logger';

// Routers
import adminRouter from './admin';
import apiRouter from './api';
import authRouter from './auth';
import homeRouter from './home';
import profilRouter from './profil';
import otherDataRouter from './other-data';

// Config helpers
import helmet from '../config/helmet';
import passport from '../config/passport';
import rateLimit from '../config/rate-limiter';
import session from '../config/session';

const R = Router();

/******************************
 * 		LOAD MIDDLEWARES
 *****************************/

// COMPRESSION
R.use(compression());
// HELMET
R.use(helmet);
// BODY-PARSER
R.use(bodyParser.urlencoded({ extended: false }))
R.use(bodyParser.json());
// COOKIE-PARSER
R.use(cookieParser());
// CONNECT-FLASH
R.use(flash());
// EXPRESS-SESSION
R.use(session);
// PASSPORT
R.use(passport.initialize());
R.use(passport.session());
// LIMITER: General rule, may be specified as middleware later for specific route
R.use(rateLimit());

/******************************
 * 		LOAD ROUTES
 *****************************/

// App routes
const App = Router();
App.use('/', homeRouter);
App.use('/', authRouter);
App.use('/admin', adminRouter);
App.use('/profil', profilRouter);
App.use('/display-user', otherDataRouter);
App.use((err: any, req: Request, res: Response, next: NextFunction) => {
	logger.error(err.message);
	logger.error(err.stack);

	res.status(500).render('500');
});
R.use('/',  csrf({ cookie: true }), App);

// API routes
const API = Router();
API.use(apiRouter);
API.use((err: any, req: Request, res: Response, next: NextFunction) => {
	logger.error(err.message);
	logger.error(err.stack);

	res.status(500).api('Something went wrong, please contact an admin');
});
R.use('/api', API);

// Unkown routes
R.use((_, res) => res.status(404).render('404'));

export default R;
