/*
 * logger.ts
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

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logFormat = winston.format.printf(i => `[${i.timestamp}] [${i.level}] ${i.message}`);

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL,
	format: winston.format.combine(
		winston.format.timestamp(),
		logFormat
	),
	transports: [
		//
		// - Write to all logs with level `info` and below to `combined.log`
		// - Write all logs error (and below) to `error.log`.
		//
		new DailyRotateFile({
			filename: './logs/%DATE%-combined.log'
		}),
		new DailyRotateFile({
			filename: './logs/%DATE%-error.log',
			level: 'error',
		}),
	],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
	logger.add(
		new winston.transports.Console({
			level:  process.env.DEBUG_LOG_LEVEL,
			format: winston.format.combine(
				winston.format.colorize({
					level: true,
				}),
				logFormat
			),
		})
	);
}

export default logger;
