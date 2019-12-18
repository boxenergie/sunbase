import influx from '../InfluxDB/TableReleves';
import users from '../InfluxDB/Users';
import Influx from 'influx';
import * as Sqrl from "squirrelly";
import { NextFunction, Response, Request } from "express";

export async function render(req: Request, res: Response, next: NextFunction) {
  try {
    const results = await influx.query(
      `SELECT SUM("production") AS production,
      SUM("consumption") AS consumption,
      SUM("surplus") AS surplus
      from "EnergyRecord"`
    );
		res.send( 
      Sqrl.renderFile("./views/homepage.squirrelly", {test: results[0]})
    );
  } catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
  }
}

export async function renderLoginPage(req: Request, res: Response, next: NextFunction) {
  try {
    res.send(Sqrl.renderFile('./views/loginpage.squirrelly', {logged: 'false'}));
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
}

export async function renderLoggedInPage(req: Request, res: Response, next: NextFunction) {
  try {
    const username = req.body.username;
    const password = req.body.password;

    console.log(`Username is ${username} and password is ${password}`);
  
    const results = await users.query(
      `SELECT * FROM "User" WHERE "username"='${username}' AND "password"='${password}'`
    );
    console.log(results[0]);
		res.send( 
      Sqrl.renderFile("./views/loginpage.squirrelly", {logged: 'true', test: results[0]})
    );
  } catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
  }  
}
