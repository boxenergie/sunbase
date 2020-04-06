/*
 * Permission.ts
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

import { Schema, Types } from 'mongoose';
import User, { UserDocument } from '../models/User';
import { Model } from 'models';
import logger from "../utils/logger";


export interface PermissionDocument extends Model.Permission.Data, Document { }

export const permissionSchema = new Schema<PermissionDocument>({
	granting: { type: Schema.Types.Map, of: [String] },
	granted: { type: Schema.Types.Map, of: [String] },
});

export function isPermissionType(permType: any): permType is Model.Permission.Type {
	return typeof permType === 'string' && (
		permType === 'read'
	);
}

permissionSchema.methods.resolveForDisplay = async function() {
	const allIds = [...new Set([...this.granted.keys(), ...this.granting.keys()])];
	const allUsers = indexNames(await User.find({
		_id: { $in: allIds.map(Types.ObjectId) }
	}));
	const permissions = {
		granted: remapPermissions(this.granted, allUsers),
		granting: remapPermissions(this.granting, allUsers)
	};
	return permissions;
}

function indexNames(users: UserDocument[]): {[k: string]: string} {
	return Object.assign({}, ...users.map((u) => ({ [u._id]: u.username })));
}

function remapPermissions(perms: Map<string, string[]>, users: {[k: string]: string}): Model.Permission.ResolvedRow {
	const ret: {[k: string]: string[]} = {};
	for (let id of perms.keys()) {
		ret[users[id]] = perms.get(id)!;
	}
	return ret;
}

