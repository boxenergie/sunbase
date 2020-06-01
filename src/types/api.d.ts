/*
 * api.d.ts
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

import { UserDocument } from '../models/User';
import FlashMessages from '../utils/flash-messages';

declare global {
	namespace Express {
		interface Request {
			flash(event: string, message: string, ...params: string[]): any;
			flashError(message: FlashMessages, ...params: string[]): any;
			flashSuccess(message:FlashMessages, ...params: string[]): any;
		}

		interface Response {
			api(body?: Object | string): void;
		}

		interface User extends UserDocument {}
	}
}
