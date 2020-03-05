/*
 * server.ts
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

import app from './app';
import logger from './utils/logger';
import User from './models/User';

app.on('ready', () => {
	app.listen(process.env.PORT, async () => {
		await User.create({username: 'admin', password: 'admin', role: 'admin'})
		logger.info(`Now listening on http://localhost:${process.env.PORT}`);
	});
});

process.on('unhandledRejection', function(err) {
	// @ts-ignore
	logger.error(`Unhandled Rejection: ${err.message}`)
});

process.on('uncaughtException', function(err) {
	logger.error(`Uncaught Exception: ${err.message}`)
});
