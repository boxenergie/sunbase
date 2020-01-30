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
