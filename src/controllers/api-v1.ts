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

import { Response, Request, NextFunction } from "express";
import { escape } from "influx";
import { Validator } from 'jsonschema';

import InfluxClient from '../db/influxdb';
import logger from '../utils/logger';

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
			type: 'string'
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

	// [HTTP version] [Client IP] [Method]  PI call on https://...
	// Will also show who did the request if the user is authenticated
	const format = 
		`[HTTP v${req.httpVersion}] `
		+ `[${req.headers['x-forwarded-for'] ?? req.connection.remoteAddress}] `
		+ `[${req.method}] `
		+ `API call on ${req.path}`
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
export const getAllEnergyRecords = (req: Request, res: Response) => {
	InfluxClient.query<Object>(
		`SELECT SUM("production"),
		SUM("consumption"),
		SUM("surplus") 
		from "EnergyRecord"`
	).then((results) => {
		// Delete all unnecessary data
		const r: Array<any> = [results[0]];
		delete r[0].time;

		logger.debug(r);
		return res.api(results);
	}).catch(err => {
		logger.error(err);
		return res.status(500).api('Something went wrong');
	});
}

/**
 * POST /api/v1/energy/
 * Add an Energy Record to the database
 * Required request parameters:
 *  - INTEGER production >= 0
 *  - INTEGER consumption >= 0
 *  - INTEGER created_by
 */
export const addEnergyRecord = (req: Request, res: Response) => {
	if (!validator.validate(req.body, addEnergyRecordSchema).valid) {
		return res.status(400).api('Missing one or more required fields or wrong type');
	}
	
	InfluxClient.writePoints([
		{
			measurement: 'EnergyRecord',
			fields: {
				production: req.body.production,
				consumption: req.body.consumption,
				surplus: (req.body.production - req.body.consumption)
		  	},
			  tags: { created_by: escape.tag(req.body.created_by) },
		}
	]).then(() => {
		return res.api('Successfully added your Energy Record');
	}).catch(err => {
		logger.error(err);
		return res.status(500).api('Something went wrong');
	});
};
