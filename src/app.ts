import express from 'express';
import path from 'path';

// Controllers
// import * as ... from './controllers/...';

// Create Express server
const app = express();

// Express configuration
app.set('port', process.env.PORT || 8080);
app.enable('strict routing');

app.use(express.static(path.join(__dirname, 'public')));

/**
 * App routes
 */


/**
 * API routes
 */


/**
 * Unknown route
 */


export default app;
