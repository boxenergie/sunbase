/*
 * add-raspberry-controller.ts
 * Copyright (C) 2019-2020 Sunshare, Evrard Teddy, Hervé Fabien, Rouchouze Alexandre
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

import { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

import logger from '../utils/logger';
import User from '../models/User';
import FlashMessages from '../utils/flash-messages';

export async function renderDeleteRaspberryPage(req: Request, res: Response, next: NextFunction) {
	if (req.query.deleted) {
		return deleteRaspberry(req, res, next);
	}

	res.render('delete-raspberry', {
		errorMsg   : req.flash('errorMsg'),
		successMsg : req.flash('successMsg'),
		raspberries: await User.find({ username: new RegExp(`^${req.user!.username}/.+`) }),
		user       : req.user,
	});
}

export async function deleteRaspberry(req: Request, res: Response, next: NextFunction) {
	const deletedRaspberryId = sanitize(req.query.deleted);
	const me                 = req.user!;

	const targetRaspberry = await User.findById(deletedRaspberryId);

	if (deletedRaspberryId === me.id) req.flashError(FlashMessages.SELF_DELETION);
	else if (!targetRaspberry) req.flashError(FlashMessages.USER_NOT_FOUND, '<???>');
	else if (targetRaspberry!.role !== 'raspberry') req.flashError(FlashMessages.NOT_RASPBERRY);
	else if (!targetRaspberry!.raspberry!.owner.equals(me._id))
		req.flashError(FlashMessages.INVALID_RASPBERRY);
	else {
		await User.findOneAndDelete({ _id: deletedRaspberryId });

		req.flashSuccess(FlashMessages.RASPBERRY_DELETED);
		logger.info(
			`Raspberry ${targetRaspberry!.username} (${deletedRaspberryId}) deleted by ${
				me.username
			}.`
		);
	}

	res.redirect('/profil/delete-raspberry');
}
