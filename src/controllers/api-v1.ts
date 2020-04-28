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

import { Response, Request, NextFunction } from 'express';
import { Validator } from 'jsonschema';

import * as InfluxHelper from '../utils/InfluxHelper';
import logger from '../utils/logger';

const validator = new Validator();
const addEnergyRecordSchema = {
	"oneOf": [
		{
			type: 'object',
			properties: {
				production_index: {
					type: 'number',
					minimum: 0,
				},
				injection_index: {
					type: 'number',
					minimum: 0,
				},
				withdrawal_index: {
					type: 'number',
					minimum: 0,
				},
				production: { type: 'undefined' },
				consumption: { type: 'undefined' },
				raspberry_mac: {
					type: 'string',
					pattern: /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/
				},
			},
			required: [ 'production_index', 'withdrawal_index', 'raspberry_mac' ]
		},
		{
			type: 'object',
			properties: {
				production_index: { type: 'undefined' },
				withdrawal_index: { type: 'undefined' },
				injection_index: { type: 'undefined' },
				production: {
					type: 'number',
					minimum: 0,
				},
				consumption: {
					type: 'number',
					minimum: 0,
				},
				raspberry_mac: {
					type: 'string',
					pattern: /([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})/,
				}
			},
			required: [ 'production', 'raspberry_mac' ]
		}
	]
};

const addWindRecordSchema = {
	type: 'object',
	properties: {
		wind_speed: {
			type: 'number',
			minimum: 0,
		},
		production: {
			type: 'number',
			minimum: 0,
		},
		rotor_speed: {
			type: 'number',
			minimum: 0,
		},
		relative_orientation: {
			type: 'number',
		},
		raspberry_mac: {
			type: 'string',
			pattern: /[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}/,
		}
	}
};

/**
 * Get middleware which adds one function to the Response object from Express:
 * 		api(body?: Object | string): void;
 */
export const getApiFunction = (
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
export const getApiInfo = (_: Request, res: Response) => {
	res.api();
};

/**
 * GET /api/v1/energy/
 * Get a sum of all production, consumption, surplus records
 */
export const getAllEnergyRecords = async (req: Request, res: Response) => {
	try {
		const results = await InfluxHelper.query(
			`SELECT SUM("production") AS "sum_production",
			SUM("consumption") AS "sum_consumption",
			SUM("surplus") AS "sum_surplus" 
			FROM "EnergyRecord"`, { deleteTimestamp: true }
		);

		res.api(results);
	} catch (err) {
		logger.error(err.message);
		return res.status(500).api('Something went wrong');
	}
};

/**
 * POST /api/v1/energy/
 * Add an Energy Record to the database
 * Required request parameters:
 *  - INTEGER production >= 0
 *  - INTEGER consumption >= 0
 *  - STRING raspberry_mac
 */
export const addEnergyRecord = async (req: Request, res: Response) => {
	const validation = validator.validate(req.body, addEnergyRecordSchema, {nestedErrors: true} as any);
	if (!validation.valid) {
		return res.status(400).api(`Missing one or more required fields or wrong type (${validation})`);
	}

	try {
		let production_index: number;
		let withdrawal_index: number;
		let injection_index: number;
		let production: number;
		let consumption: number;
		let surplus: number;

		if (req.body.production_index !== undefined) {
			production_index = req.body.production_index;
			withdrawal_index = req.body.withdrawal_index;
			injection_index = req.body.injection_index;
			const previousIdx = await InfluxHelper.query(
				`SELECT 
				LAST("production_index") as last_production, 
				LAST("withdrawal_index") as last_withdrawal,
				LAST("injection_index")  as last_injection
				FROM "EnergyRecord" WHERE raspberry_mac = '${req.body.raspberry_mac}'`
			);
			// if it's the first index, we can't know the production
			const isFirstIndex = previousIdx.rows.length == 0;
			production = isFirstIndex ? 0 : (production_index - previousIdx.rows[0].last_production);
			const withdrawal = isFirstIndex ? 0 : (withdrawal_index - previousIdx.rows[0].last_withdrawal);
			const injection = isFirstIndex ? 0 : (injection_index - previousIdx.rows[0].last_injection);
			if (production < 0 || withdrawal < 0 || injection < 0) logger.warn("One or more indices have shrunk!");
			if (withdrawal && injection) logger.warn(`Injection (${injection}) and withdrawal (${withdrawal}) are both non-null.`);
			surplus = injection - withdrawal;
			consumption = production - surplus;
		} else {
			production_index = 0;
			withdrawal_index = 0;
			injection_index = 0;
			production = req.body.production ?? 0;
			consumption = req.body.consumption ?? 0;
			surplus = production - consumption
		}

		await InfluxHelper.insert('EnergyRecord', [
			{
				fields: {
					production_index,
					withdrawal_index,
					injection_index,
					production,
					consumption,
					surplus,
				},
				tags: { raspberry_mac: req.body.raspberry_mac },
			}
		]);

		logger.debug('Successfully added Energy Record: ' +
			`${production} | ${consumption} ` +
			`by '${req.body.raspberry_mac}'`
		);

		return res.api('Successfully added your Energy Record');
	} catch (err) {
		logger.error(err.message);
		return res.status(500).api('Something went wrong');
	}
};

/**
 * GET /api/v1/wind/
 * Get a mean of all wind records
 */
export const getAllWindRecords = async (req: Request, res: Response) => {
	try {
		const results = await InfluxHelper.query(
			`SELECT 
			MEAN("wind_speed"),
			MEAN("production"),
			MEAN("rotor_speed"),
			MEAN("relative_orientation") 
			FROM "WindRecord"`, { deleteTimestamp: true }
		);

		res.api(results);
	} catch (err) {
		logger.error(err.message);
		return res.status(500).api('Something went wrong');
	}
};

/**
 * POST /api/v1/wind/
 * Add a Wind Record to the database
 * Required request parameters:
 *  - FLOAT wind_speed >= 0
 *  - FLOAT production >= 0
 *  - FLOAT rotor_speed >= 0
 *  - FLOAT relative_orientation
 *  - STRING raspberry_mac
 */
export const addWindRecord = async (req: Request, res: Response) => {
	if (!validator.validate(req.body, addWindRecordSchema).valid) {
		return res.status(400).api('Missing one or more required fields or wrong type');
	}

	try {
		await InfluxHelper.insert('WindRecord', [
			{
				fields: {
					wind_speed: req.body.wind_speed,
					production: req.body.production,
					rotor_speed: req.body.rotor_speed,
					relative_orientation: req.body.relative_orientation,
				},
				tags: { raspberry_mac: req.body.raspberry_mac },
			}
		]);

		logger.debug('Successfully added Wind Record: ' +
			`${req.body.wind_speed} | ${req.body.production} | ` +
			`${req.body.rotor_speed} | ${req.body.relative_orientation} ` +
			`by '${req.body.raspberry_mac}'`
		);

		return res.api('Successfully added your Wind Record');
	} catch (err) {
		logger.error(err.message);
		return res.status(500).api('Something went wrong');
	}
};
