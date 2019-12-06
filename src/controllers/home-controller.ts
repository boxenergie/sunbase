import influx from '../InfluxDB/TableReleves';
import Influx from 'influx';
import * as Sqrl from "squirrelly";
import { NextFunction, Response, Request } from "express";

export default async function render(req: Request, res: Response, next: NextFunction) {
  console.log("Hello");
  try {
    const results = await influx.query(
      `SELECT SUM("production") AS production,
      SUM("consumption") AS consumption,
      SUM("surplus") AS surplus
      from "EnergyRecord"`
    );
		res.send( 
      Sqrl.renderFile("./views/test.squirrelly", {test: results[0]})
    );
  } catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
  }
}
