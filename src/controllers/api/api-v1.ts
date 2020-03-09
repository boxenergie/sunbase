/*
 * api-v1.ts
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

import { NextFunction, Response, Request } from "express";
import { Validator } from 'jsonschema';

import * as InfluxHelper from '../../utils/influx-helper';
import logger from '../../utils/logger';
import User from '../../models/User';

const validator = new Validator();
const addEnergyRecordSchema = {
	type: 'object',
	properties: {
		production: {
			type: 'number',
			minimum: 0
		},
		consumption: {
			type: 'number',
			minimum: 0
		},
		created_by: {
			type: 'string',
			pattern: /^[0-9a-fA-F]{24}$/,
		},
		username: {
			type: 'string'
		},
		password: {
			type: 'string'
		}
	}
};

const addWindRecordSchema = {
	type: 'object',
	properties: {
		wind_speed: {
			type: 'number',
			minimum: 0
		},
		production: {
			type: 'number',
			minimum: 0
		},
		rotor_speed: {
			type: 'number',
			minimum: 0
		},
		relative_orientation: {
			type: 'number'
		},
		created_by: {
			type: 'string',
			pattern: /^[0-9a-fA-F]{24}$/,
		},
		username: {
			type: 'string'
		},
		password: {
			type: 'string'
		}
	}
};

/**
 * Get middleware which adds one function to the Response object from Express:
 * 		api(body?: Object | string): void;
 */
export const getApiFunction = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	res.api = (body?: Object | string) => {
		let content = {
			version: 1.0,
			timestamp: new Date(),
		};

		if (typeof body === 'object') content = { ...content, ...body };
		else Object.assign(content, { message: body });

		res.json(content);
	};

	// [HTTP version] [Client IP] [Method] API call on https://...
	// Will also show who did the request if the user is authenticated
	const format =
		`[HTTP v${req.httpVersion}] `
		+ `[${req.headers['x-forwarded-for'] ?? req.connection.remoteAddress}] `
		+ `[${req.method}] `
		+ `API call on ${req.originalUrl}`
		+ (req.isAuthenticated() ? ` by ${req.user?.username}` : '');

	logger.info(format);

	next();
};

/**
 * GET /api/v1/
 * API information
 */
export const getApiInfo = async (_: Request, res: Response) => {
	res.api();
};

/**
 * GET /api/v1/energy/
 * Get a sum of all production, consumption, surplus records from the past 24h.
 * Timestamp is GMT+0
 */
export const getAllEnergyRecords = async (_: Request, res: Response) => {
	const results = await InfluxHelper.query(
		`SELECT
		SUM(production) AS production,
		SUM(consumption) AS consumption,
		SUM(surplus) AS surplus
		FROM "EnergyRecord"
		WHERE time >= now() - 1d AND time <= now()
		GROUP BY time(15m) fill(none)`
	);
	
	res.api(results);
};

/**
 * POST /api/v1/energy/
 * Add an Energy Record to the database
 * Required request parameters:
 *  - INTEGER production >= 0
 *  - INTEGER consumption >= 0
 *  - STRING created_by
 */
export const addEnergyRecord = async (req: Request, res: Response) => {
	if (!validator.validate(req.body, addEnergyRecordSchema).valid) {
		return res.status(400).api('Missing one or more required fields or wrong type');
	}

	// Check if specified user exists
	const user = await User.Model.findById(req.body.created_by).orFail();

	await InfluxHelper.insert('EnergyRecord', [
		{
			fields: {
				production: req.body.production,
				consumption: req.body.consumption,
				surplus: (req.body.production - req.body.consumption)
			},
			tags: { created_by: req.body.created_by },
		}
	]);

	logger.debug('Successfully added Energy Record: ' +
		`${req.body.production} | ${req.body.consumption} ` +
		`by '${user!.username}' (${req.body.created_by})`
	);

	res.api('Successfully added your Energy Record');
};

/**
 * GET /api/v1/wind/
 * Get a mean of all wind records from the past 24h.
 */
export const getAllWindRecords = async (_: Request, res: Response) => {
	const results = await InfluxHelper.query(
		`SELECT
		MEAN("wind_speed") as mean_wind_speed,
		MEAN("production") as mean_production,
		MEAN("rotor_speed") as mean_rotor_speed,
		MEAN("relative_orientation") as mean_relative_orientation
		FROM "WindRecord"
		WHERE time >= now() - 1d AND time <= now()
		GROUP BY time(15m) fill(none)`
	);

	res.api(results);
};

/**
 * POST /api/v1/wind/
 * Add a Wind Record to the database
 * Required request parameters:
 *  - FLOAT wind_speed >= 0
 *  - FLOAT production >= 0
 *  - FLOAT rotor_speed >= 0
 *  - FLOAT relative_orientation
 *  - STRING created_by
 */
export const addWindRecord = async (req: Request, res: Response) => {
	if (!validator.validate(req.body, addWindRecordSchema).valid) {
		return res.status(400).api('Missing one or more required fields or wrong type');
	}

	// Check if specified user exists
	const user = await User.Model.findOne({ _id: req.body.created_by }).orFail();

	await InfluxHelper.insert('WindRecord', [
		{
			fields: {
				wind_speed: req.body.wind_speed,
				production: req.body.production,
				rotor_speed: req.body.rotor_speed,
				relative_orientation: req.body.relative_orientation
			},
			tags: { created_by: req.body.created_by },
		}
	]);

	logger.debug('Successfully added Wind Record: ' +
		`${req.body.wind_speed} | ${req.body.production} | ` +
		`${req.body.rotor_speed} | ${req.body.relative_orientation} ` +
		`by '${user!.username}' (${req.body.created_by})`
	);

	res.api('Successfully added your Wind Record');
};
