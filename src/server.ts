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
import * as localization from './lang/localization';

app.on('ready', async () => {
	await localization.init();
	app.listen(process.env.PORT, async () => {
		logger.info(`Now listening on http://localhost:${process.env.PORT}`);
	});
});

process.on('unhandledRejection', function(err) {
	logger.error('Unhandled Rejection: ',  err);
	console.log(err);
});

process.on('uncaughtException', function(err) {
	logger.error('Uncaught Exception: ', err);
	console.log(err);
});
