import { NextFunction, Response, Request } from 'express';
import * as Sqrl from 'squirrelly';

export function renderLoginPage(req: Request, res: Response, next: NextFunction) {
	try {
		res.send(Sqrl.renderFile('./views/loginpage.squirrelly', { csrfToken: req.csrfToken() }));
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}

export function logOut(req: Request, res: Response, next: NextFunction) {
	req.logout();
	req.session?.destroy((err) => {
        if (!err) {
            res.clearCookie('connect.sid', {path: '/'}).redirect('/');
        } else {
			console.log(err);
            res.send('Impossible to logout, please contact an admin');
        }
    });
}