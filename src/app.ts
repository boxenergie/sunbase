import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import express from 'express';
import flash from 'connect-flash';
import passport from 'passport';
import path from 'path';
import csrf from 'csurf';

// Controllers
import * as adminController from './controllers/admin-controller';
import * as apiControllerV1 from './controllers/api-v1';
import * as authController from './controllers/auth-controller';
import * as homeController from './controllers/home-controller';
import * as profilController from './controllers/profil-controller';

// Load .env
dotenv.config();

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 8080);
app.enable('strict routing');

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Middleware
 */
// helmet
import helmetSetup from './config/helmet';
helmetSetup(app);
// body-parser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
// cookie-parser
app.use(cookieParser());
// connect-flash
app.use(flash());
// express-session
import sessionSetup from './config/session';
sessionSetup(app);
// passport
import passportSetup from './config/passport';
passportSetup(passport);
app.use(passport.initialize());
app.use(passport.session());

/**
 * API routes
 */
app.use('/api/v1/*', apiControllerV1.getApiFunction);
app.get('/api/v1/', apiControllerV1.getApiInfo);

app.get('/api/v1/energy/', apiControllerV1.getAllEnergyRecords);
app.post('/api/v1/energy/', passport.authenticate('local',
	{
		session: false
	}
), apiControllerV1.addEnergyRecord);

// Csurf
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
 * Unknown route
 */
app.use((_, res) => {
	res.sendStatus(404);
});

export default app;