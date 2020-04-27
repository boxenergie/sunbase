/*
 * add-raspberry-controller.ts
 * Copyright (C) Sunshare 2019
 *
 * This file is part of Sunbase.
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { NextFunction, Response, Request } from 'express';
import sanitize from 'mongo-sanitize';

import logger from '../utils/logger';
import User from '../models/User';

export async function renderDeleteRaspberryPage(req: Request, res: Response, next: NextFunction) {
	try {
		if (req.query.deleted) {
			return deleteRaspberry(req, res, next);
		}

		res.render('delete-raspberry', {
			csrfToken: req.csrfToken(),
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
			raspberries: await User.find({ username: new RegExp(`^${req.user!.username}/.+`) }),
		});
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}

export async function deleteRaspberry(req: Request, res: Response, next: NextFunction) {
	try {
		const deletedRaspberryId = sanitize(req.query.deleted);
		const me = req.user!;
		const error = (msg: string) => req.flash('errorMsg', msg);
		const succeed = (msg: string) => req.flash('successMsg', msg);

		const targetRaspberry = await User.findById(deletedRaspberryId);

		if (deletedRaspberryId === me.id)
			error('You cannot delete yourself.');
		else if (!targetRaspberry)
			error('User did not exist.');
		else if (targetRaspberry!.role !== 'raspberry')
			error('You can only delete raspberry.');
		else if (!targetRaspberry!.raspberry!.owner.equals(me._id))
			error('You cannot delete a raspberry you did not create.');
		else {
			await User.deleteOne({ _id: deletedRaspberryId });

			succeed('Raspberry unlinked.');
			logger.info(`Raspberry ${targetRaspberry!.username} (${deletedRaspberryId}) deleted by ${me.username}.`);
		}

		res.redirect('/profil/delete-raspberry');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
