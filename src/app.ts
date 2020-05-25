/*
 * app.ts
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

import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv-safe';
import express, { Router } from 'express';
import flash from 'connect-flash';
import helmet from 'helmet';
import schedule  from 'node-schedule';
import passport from 'passport';
import path from 'path';
import csrf from 'csurf';

// Load .env
dotenv.config();

// Load MongoDB
import './db/mongodb';

// Controllers
import * as adminController from './controllers/admin-controller';
import * as addRaspberryController from './controllers/add-raspberry-controller';
import * as apiControllerV1 from './controllers/api-v1';
import * as authController from './controllers/auth-controller';
import * as deleteRaspberryController from './controllers/delete-raspberry-controller';
import * as homeController from './controllers/home-controller';
import * as profilController from './controllers/profil-controller';
import * as otherDataController from './controllers/other-data-controller';
import * as registerController from './controllers/register-controller';

// Create Express server
const app = express();

// Express configuration
app.set('views', path.join(__dirname, '..', 'views'));
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine({
	beautify: process.env.NODE_ENV !== 'production'
}));
app.disable('strict routing');

app.use(express.static(path.join(__dirname, 'public')));

// Setup jobs
import jobs from './config/jobs';
for (const [jobSchedule, jobFn] of jobs) {
	schedule.scheduleJob(jobSchedule, jobFn);
}

/**
 * Middleware
 */

 /* HELMET */
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
	directives: {
		defaultSrc: [ "'self'", 'https://fonts.gstatic.com' ],
		styleSrc: [ "'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdnjs.cloudflare.com' ],	
		scriptSrc: [ "'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com' ],
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
import FlashMessages from "./utils/flash-messages";
import { localizeFlash, getSupportedLocales } from "./lang/localization";

app.use((req, _, next) => {
	req.flashLocalized = (event: string, message: FlashMessages, ...params: string[]) => {
		const preferredLang = req.acceptsLanguages(getSupportedLocales()) || 'fr';
		req.flash(event, localizeFlash(preferredLang, message), ...params);
	}
	next();
});

/**
 * App routes
 */
appRouter.get('/', homeController.renderHomePage);
appRouter.get('/display-user', isLoggedIn(), otherDataController.renderOtherDataPage);

/**
 * Auth routes
 */
appRouter.get('/login', isNotLoggedIn(), authController.renderLoginPage);
appRouter.post('/login', isNotLoggedIn(), passport.authenticate('local',
	{
		failureRedirect: '/login',
		successRedirect:'/',
	}
));
appRouter.get('/register', isNotLoggedIn(), registerController.renderRegisterPage);
appRouter.post('/register', isNotLoggedIn(), registerController.registerUser);
appRouter.get('/logout', isLoggedIn(), authController.logOut);

/**
 * Profil routes
 */
appRouter.get('/profil', isLoggedIn(), profilController.renderProfilPage);
appRouter.post('/profil/update_email/', isLoggedIn(), profilController.changeEmail);
appRouter.post('/profil/update_username/', isLoggedIn(), profilController.changeUsername);
appRouter.post('/profil/update_password/', isLoggedIn(), profilController.changePassword);
appRouter.post('/profil/update_permissions/', isLoggedIn(), profilController.grantPermission);
appRouter.get('/profil/update_permissions/', isLoggedIn(), profilController.removePermission);
appRouter.get('/profil/add-raspberry', isLoggedIn(), addRaspberryController.renderAddRaspberryPage);
appRouter.post('/profil/add-raspberry', isLoggedIn(), addRaspberryController.addRaspberry);
appRouter.get('/profil/delete-raspberry', isLoggedIn(), deleteRaspberryController.renderDeleteRaspberryPage);

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
apiRouter.post('/v1/energy/', apiControllerV1.addEnergyRecord);
apiRouter.get('/v1/wind/', apiControllerV1.getAllWindRecords);
apiRouter.post('/v1/wind/', apiControllerV1.addWindRecord);
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
