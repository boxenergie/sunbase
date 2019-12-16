import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import passport from 'passport';

// Controllers
import * as apiControllerV1 from './controllers/api-v1';
import {render, renderLoggedInPage, renderLoginPage} from './controllers/home-controller';

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
app.use(passport.initialize());
app.use(passport.session());

/**
 * App routes
 */
app.get('/', render);
app.get('/login', renderLoginPage);
app.post('/login', renderLoggedInPage);

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


export default app;
