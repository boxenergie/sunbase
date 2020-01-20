import { NextFunction, Response, Request, RequestHandler } from 'express';

type OptionalRedirect = {
    failureRedirect?: string;
}

/**
 * This function provides a middleware to prevent non-logged in user to access
 * certain data.
 * How to use :
 *  - app.get('/', isLoggedIn(), ...);
 *  - app.get('/', isLoggedIn({ failureRedirect: '/' }), ...);
 * @param failureRedirect Where to redirect the user if he isn't logged in, default is '/login'
 */
export function isLoggedIn(opt: OptionalRedirect = {}): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.isAuthenticated()) return next();

		res.redirect(opt.failureRedirect ?? '/login');
	};
}

/**
 * This function provides a middleware to prevent logged in user to access
 * certain data.
 * How to use :
 *  - app.get('/', isNotLoggedIn(), ...);
 *  - app.get('/', isNotLoggedIn({ failureRedirect: '/' }), ...);
 * @param failureRedirect Where to redirect the user if he is logged in, default is '/'
 */
export function isNotLoggedIn(opt: OptionalRedirect = {}): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.isAuthenticated()) return next();

		res.redirect(opt.failureRedirect ?? '/');
	};
}

/**
 * This function provides a middleware to prevent non-admin user to access
 * certain data. Additionally, it will also check if the user is logged in.
 * How to use :
 *  - app.get('/', isAdmin(), ...);
 *  - app.get('/', isAdmin({ failureRedirect: '/' }), ...);
 * @param failureRedirect Where to redirect the user if he isn't admin, default is '/login'
 */
export function isAdmin(opt: OptionalRedirect = {}): RequestHandler {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.isAuthenticated() && req.user?.role == 'admin') return next();

		res.redirect(opt.failureRedirect ?? '/login');
	};
}
