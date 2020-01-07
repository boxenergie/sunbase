import { Response, Request, NextFunction } from 'express';
import InfluxClient from '../db/influxdb';


/**
 * Get middleware which adds one function to the Response object from Express:
 * 		api(body?: Object | string): void;
 */
export const getApiFunction = (
	_: Request,
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
	InfluxClient.query(
		`SELECT SUM("production"),
		SUM("consumption"),
		SUM("surplus") 
		from "EnergyRecord"`
	).then((results) => {
		return res.api(results);
	}).catch((err: String) => {
		console.error(err);
		return res.status(500).api('Something went wrong');
	});
}

/**
 * POST /api/v1/energy/
 * Add an Energy Record to the database
 * Required request parameters:
 * 	- INTEGER production
 *  - INTEGER consumption
 *  - INTEGER surplus
 *  - INTEGER created_by
 */
export const addEnergyRecord = (req: Request, res: Response) => {
	if (
		!(req.body.production >= 0) || !(req.body.consumption >= 0) || 
		!req.body.created_by
	) {
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
			  tags: { created_by: req.body.created_by },
		}
	]).then(() => {
		return res.api('Successfully added your Energy Record');
	}).catch((err: String) => {
		console.error(err);
		return res.status(500).api('Something went wrong');
	});
};
