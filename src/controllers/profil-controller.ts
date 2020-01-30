/*
 * profil-controller.ts
 * Copyright (C) Sunshare 2019
 * This file is part of Sunbase.
 * Sunbase is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * Sunbase is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with Sunbase. If not, see <http://www.gnu.org/licenses/>.
 */

import * as Sqrl from 'squirrelly';
import { NextFunction, Response, Request } from 'express';

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
        } catch {
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
