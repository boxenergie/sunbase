import { Express } from 'express'
import expressSession from 'express-session';

export default (app: Express) => {
    if (!process.env.SESSION_SECRET) {
        console.error('SESSION_SECRET must be provided in the .env file.');
        process.exit();
    }

    const session = {
        secret: process.env.SESSION_SECRET,
        resave: true,
        saveUninitialized: false,
        cookie: { secure: false }
    }

    if (app.get('env') === 'production') {
        app.set('trust proxy', 1)
        session.cookie.secure = true 
    }

    app.use(expressSession(session));
}