import * as Sqrl from 'squirrelly';
import { NextFunction, Response, Request } from 'express';

import User from '../models/User';

export async function renderAdminPage(req: Request, res: Response, next: NextFunction) {
    if (req.body.deleted) {
        deleteUser(req, res, next);
        return;
    }
	try {
        const users = await User.find().limit(10).exec();
        res.send(Sqrl.renderFile('./views/adminpage.squirrelly', {
            users
        }));
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        let errorMsg = null;
        const deletedUserId = req.body.deleted;

        if (!deletedUserId) {
            errorMsg = 'One or more fields were not provided.';
        }        

        try {
            await User.deleteOne({id: deletedUserId});
            req.flash('successMsg', 'User deleted.');
            return res.redirect('/admin');
        } catch {
            req.flash('errorMsg', errorMsg ?? 'Username already exists.');
            return res.redirect('/admin');
        }
    } catch (err) {
        console.error(err);
		res.status(500).send('Something went wrong');
	}
}