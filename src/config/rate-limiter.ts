/*
 * rate-limiter.ts
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
import rateLimit from 'express-rate-limit';

export const defaultOptions = {
	windowMs: 15 * 60 * 1000, // 15 mn
	max: 250, // Limit each IP to 250 requests per windowMs 
	message: 'Too many requests, please try again later.',
}

export default (opt: rateLimit.Options = {}) => rateLimit(Object.assign(opt, defaultOptions));
