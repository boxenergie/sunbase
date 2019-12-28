import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import express from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import path from 'path';

// Controllers
import * as apiControllerV1 from './controllers/api-v1';
import * as authController from './controllers/auth-controller';
import * as homeController from './controllers/home-controller';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 8080);
app.enable('strict routing');

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Passport setup
 */
import { setup as passportSetup } from './config/passport';
passportSetup(passport);

/**
 * Middleware
 */
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(cookieParser());
// ! TODO Use .env for secret + better secret !
app.use(expressSession({secret: 'SunShare', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

import { isLoggedIn, isNotLoggedIn, isAdmin } from './utils/auth';
/**
 * App routes
 */
app.get('/', homeController.render);

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
 * API routes
 */
app.use('/api/v1/*', apiControllerV1.getApiFunction);
app.get('/api/v1/', apiControllerV1.getApiInfo);

app.get('/api/v1/energy/', apiControllerV1.getAllEnergyRecords);
app.post('/api/v1/energy/', apiControllerV1.addEnergyRecord);

/**
 * Unknown route
 */
app.use((_, res) => {
	res.sendStatus(404);
});

export default app;