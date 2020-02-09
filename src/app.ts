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

// Controllers
import * as adminController from './controllers/admin-controller';
import * as apiControllerV1 from './controllers/api-v1';
import * as authController from './controllers/auth-controller';
import * as homeController from './controllers/home-controller';
import * as profilController from './controllers/profil-controller';

// Create Express server
const app = express();

// Express configuration
app.enable('strict routing');

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
/* CSURF */
app.use(csrf({ cookie: true }))

import { isLoggedIn, isNotLoggedIn, isAdmin } from './utils/auth';
/**
 * App routes
 */
app.get('/', homeController.renderHomePage);

/**
 * Auth routes
 */
app.get('/login', isNotLoggedIn(), authController.renderLoginPage);
app.post('/login', isNotLoggedIn(), passport.authenticate('local',
	{
		failureRedirect: '/login',
		successRedirect:'/'
	}
));
app.get('/logout', isLoggedIn(), authController.logOut);

/**
 * Profil routes
 */
app.get('/profil', isLoggedIn(), profilController.renderProfilPage);
app.post('/profil/update_username/', isLoggedIn(), profilController.changeUsername);
app.post('/profil/update_password/', isLoggedIn(), profilController.changePassword);

/**
 * Admin routes
 */
app.get('/admin', isAdmin(), adminController.renderAdminPage);

/**
 * API routes
 */
const apiRouter = express.Router();
apiRouter.use('v1/*', apiControllerV1.getApiFunction);
apiRouter.get('v1/', apiControllerV1.getApiInfo);

apiRouter.get('v1/energy/', apiControllerV1.getAllEnergyRecords);
apiRouter.post('v1/energy/', passport.authenticate('local',
	{
		session: false
	}
), apiControllerV1.addEnergyRecord);
app.use('/api', apiRouter);

/**
 * Unknown route
 */
app.use((_, res) => {
	res.sendStatus(404);
});

export default app;
