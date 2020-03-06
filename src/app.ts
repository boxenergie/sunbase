/*
 * app.ts
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

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv-safe';
import express, { Router } from 'express';
import flash from 'connect-flash';
import helmet from 'helmet';
import passport from 'passport';
import path from 'path';
import csrf from 'csurf';

// Load .env
dotenv.config();

// Load MongoDB
import './db/mongodb';

// Controllers
import * as adminController from './controllers/admin-controller';
import * as apiControllerV1 from './controllers/api-v1';
import * as authController from './controllers/auth-controller';
import * as homeController from './controllers/home-controller';
import * as profilController from './controllers/profil-controller';

// Create Express server
const app = express();

// Express configuration
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'squirrelly');
app.disable('strict routing');

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware
 */

 /* HELMET */
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
	directives: {
		defaultSrc: [ "'self'" ],
		styleSrc: [ "'self'" ]
	}
}));
/* BODY-PARSER */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
/* COOKIE-PARSER */
app.use(cookieParser());
/* CONNECT-FLASH */
app.use(flash());
/* EXPRESS-SESSION */
import sessionSetup from './config/session';
sessionSetup(app);
/* PASSPORT */
import passportSetup from './config/passport';
passportSetup(passport);
app.use(passport.initialize());
app.use(passport.session());

/**
 * Router
 */
const appRouter = express.Router();
const apiRouter = express.Router();


import { isLoggedIn, isNotLoggedIn, isAdmin } from './utils/route-auth';
/**
 * App routes
 */
appRouter.get('/', homeController.renderHomePage);

/**
 * Auth routes
 */
appRouter.get('/login', isNotLoggedIn(), authController.renderLoginPage);
appRouter.post('/login', isNotLoggedIn(), passport.authenticate('local',
	{
		failureRedirect: '/login',
		successRedirect:'/',
		failureFlash: 'Invalid username or password.'
	}
));
appRouter.get('/logout', isLoggedIn(), authController.logOut);

/**
 * Profil routes
 */
appRouter.get('/profil', isLoggedIn(), profilController.renderProfilPage);
appRouter.post('/profil/update_username/', isLoggedIn(), profilController.changeUsername);
appRouter.post('/profil/update_password/', isLoggedIn(), profilController.changePassword);
appRouter.post('/profil/update_permissions/', isLoggedIn(), profilController.grantPermission);
appRouter.get('/profil/update_permissions/', isLoggedIn(), profilController.removePermission);

/**
 * Admin routes
 */
appRouter.get('/admin', isAdmin(), adminController.renderAdminPage);

/**
 * API routes
 */
apiRouter.use('/v1', apiControllerV1.getApiFunction);
apiRouter.get('/v1', apiControllerV1.getApiInfo);

apiRouter.get('/v1/energy/', apiControllerV1.getAllEnergyRecords);
apiRouter.post('/v1/energy/', passport.authenticate('local',
	{
		session: false
	}
), apiControllerV1.addEnergyRecord);
apiRouter.get('/v1/wind/', apiControllerV1.getAllWindRecords);
apiRouter.post('/v1/wind/', passport.authenticate('local',
	{
		session: false
	}
), apiControllerV1.addWindRecord);
app.use('/api', apiRouter);

/**
 * Unknown route
 */
appRouter.use((_, res) => {
	res.sendStatus(404);
});

app.use('/api', apiRouter);
app.use('/', csrf({ cookie: true }), appRouter);

export default app;
