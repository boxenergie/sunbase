import { NextFunction, Response, Request } from 'express';
import * as Sqrl from 'squirrelly';

export function renderProfilPage(req: Request, res: Response, next: NextFunction) {
	try {
		res.send(Sqrl.renderFile('./views/profilpage.squirrelly', {
            errorMsg: req.flash('errorMsg'),
            successMsg: req.flash('successMsg'),
        }));
	} catch (err) {
		console.error(err);
		res.status(500).send('Something went wrong');
	}
}

export async function changeUsername(req: Request, res: Response, next: NextFunction) {
    try {
        let errorMsg = null;

        if (!req.body.pwd || !req.body.new_username)
            errorMsg = 'One or more fields were not provided.';
        else if (req.body.pwd !== req.user?.password)
            errorMsg = 'Wrong password';
        
        try {
            req.user!.username = req.body.new_username;
            await req.user!.save();

            req.flash('successMsg', 'Username changed.');
            return res.redirect('/profil');
        } catch (e) {
            req.flash('errorMsg', errorMsg ?? 'Username already exists.');
            return res.redirect('/profil');
        }
    } catch (err) {
        console.error(err);
		res.status(500).send('Something went wrong');
	}
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
    try {
        let errorMsg = null;

        if (!req.body.old_pwd || !req.body.new_pwd || !req.body.new_pwd_confirm)
            errorMsg = 'One or more fields were not provided.';
        else if (req.body.new_pwd !== req.body.new_pwd_confirm)
            errorMsg = 'New passwords must match.';
        else if (req.body.old_pwd !== req.user?.password)
            errorMsg = 'Wrong password.';

        if (errorMsg) {
            req.flash('errorMsg', errorMsg);
            return res.redirect('/profil');
        }

        req.user!.password = req.body.new_pwd;
        await req.user!.save();

        req.flash('successMsg', 'Password changed.');
        res.redirect('/profil');
    } catch (err) {
        console.error(err);
		res.status(500).send('Something went wrong');
	}
}
