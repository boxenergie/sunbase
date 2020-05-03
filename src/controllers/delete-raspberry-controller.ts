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

import { NextFunction, Request, Response } from 'express';
import sanitize from 'mongo-sanitize';

import logger from '../utils/logger';
import User from '../models/User';
import FlashMessages from "./flash-messages";

export async function renderDeleteRaspberryPage(req: Request, res: Response, next: NextFunction) {
	try {
		if (req.query.deleted) {
			return deleteRaspberry(req, res, next);
		}

		res.render('delete-raspberry', {
			errorMsg: req.flash('errorMsg'),
			successMsg: req.flash('successMsg'),
			raspberries: await User.find({ username: new RegExp(`^${req.user!.username}/.+`) }),
			user: req.user,
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
		const error = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('errorMsg', msg, ...params);
		const succeed = (msg: FlashMessages, ...params: string[]) => req.flashLocalized('successMsg', msg, ...params);

		const targetRaspberry = await User.findById(deletedRaspberryId);

		if (deletedRaspberryId === me.id)
			error(FlashMessages.SELF_DELETION);
		else if (!targetRaspberry)
			error(FlashMessages.USER_NOT_FOUND);
		else if (targetRaspberry!.role !== 'raspberry')
			error(FlashMessages.NOT_RASPBERRY);
		else if (!targetRaspberry!.raspberry!.owner.equals(me._id))
			error(FlashMessages.INVALID_RASPBERRY);
		else {
			await User.findOneAndDelete({ _id: deletedRaspberryId });

			succeed(FlashMessages.RASPBERRY_DELETED);
			logger.info(`Raspberry ${targetRaspberry!.username} (${deletedRaspberryId}) deleted by ${me.username}.`);
		}

		res.redirect('/profil/delete-raspberry');
	} catch (err) {
		logger.error(err.message);
		res.status(500).send('Something went wrong');
	}
}
