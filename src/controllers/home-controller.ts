import * as Sqrl from 'squirrelly';
import { NextFunction, Response, Request } from "express";

import Records from '../db/influxdb';

export async function renderHomePage(req: Request, res: Response, next: NextFunction) {
	try {
		const results = await Records.query(
			`SELECT SUM("production") AS production,
			SUM("consumption") AS consumption,
			SUM("surplus") AS surplus
			from "EnergyRecord"`
		);

		res.send(
			Sqrl.renderFile("./views/homepage.squirrelly", { 
				data: results[0],
				user: req.user,
			})
		);
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}