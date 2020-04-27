/*
 * Raspberry.ts
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

import { Model } from 'models';
import { Schema } from 'mongoose';

export interface RaspberryDocument extends Model.Raspberry, Document { }

// Care with User$regexUsernameRaspberry
const regexLabel = /^[a-z0-9àâçéèêëîïôûùüÿñæœ .-_][^\/]{3,20}$/i;
const raspberrySchema = new Schema<RaspberryDocument>({
	label: { type: String, trim: true, required: true, validate: regexLabel },
	mac: {
		type: String,
		trim: true,
		required: true,
		index: {
			unique: true,
			// @ts-ignore
			// Unique rule only applies if 'mac' is NOT null
			partialFilterExpression: { 'raspberry.mac': { $type: 'string' } }
		},
	},
});

export default raspberrySchema;
