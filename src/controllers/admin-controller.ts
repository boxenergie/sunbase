import * as Sqrl from 'squirrelly';
import { NextFunction, Response, Request } from 'express';

import User from '../models/User';

export async function renderAdminPage(req: Request, res: Response, next: NextFunction) {
    if (req.query.deleted) {
        return deleteUser(req, res, next);
    }

	try {
        const users = await User.find().limit(10).exec();
        res.send(Sqrl.renderFile('./views/adminpage.squirrelly', {
            users: users,
            errorMsg: req.flash('errorMsg'),
            successMsg: req.flash('successMsg'),
        }));
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        let errorMsg = null;
        const deletedUserId = req.query.deleted;

        if (!deletedUserId) {
            errorMsg = 'One or more fields were not provided.';
        }        

        try {
            await User.deleteOne({_id: deletedUserId});
            req.flash('successMsg', 'User deleted.');
            return res.redirect('/admin');
        } catch (e) {
            req.flash('errorMsg', errorMsg ?? 'Username did not exist.');
            return res.redirect('/admin');
        }
    } catch (err) {
        console.error(err);
		res.status(500).send('Something went wrong');
	}
}