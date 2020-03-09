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

import Mongoose from 'mongoose';
import User from '../models/User';

export namespace Permission {
	export enum Type {
		READ = "read"
	};
	
	export type Row = Map<string, Type[]>;
	export type ResolvedRow = { [k: string]: string[] };
	export type Resolved = {
		granted: ResolvedRow;
		granting: ResolvedRow;
	};
	
	export interface Interface {
		resolveForDisplay(): Promise<Permission.Resolved>;
		granting: Row;
		granted: Row;
	}

	export interface Document extends Permission.Interface, Mongoose.Document {}

	export const Schema = new Mongoose.Schema<Permission.Document>({
		granting: { type: Mongoose.Schema.Types.Map, of: [String] },
		granted: { type: Mongoose.Schema.Types.Map, of: [String] },
	});
	
	Schema.methods.resolveForDisplay = async function() {
		const allIds = [...new Set([...this.granted.keys(), ...this.granting.keys()])];
		const allUsers = indexNames(await User.Model.find({
			_id: { $in: allIds.map(Mongoose.Types.ObjectId) }
		}));
	
		return {
			granted: remapPermissions(this.granted, allUsers),
			granting: remapPermissions(this.granting, allUsers)
		};
	}
}

export function isPermission(permType: any): permType is Permission.Type {
	return Object.values(Permission.Type).includes(permType);
}

function indexNames(users: User.Document[]): {[k: string]: string} {
	return Object.assign({}, ...users.map((u) => ({ [u._id]: u.username })));
}

function remapPermissions(perms: Map<string, string[]>, users: {[k: string]: string}): Permission.ResolvedRow {
	const ret: {[k: string]: string[]} = {};

	for (const id of perms.keys()) {
		ret[users[id]] = perms.get(id)!;
	}

	return ret;
}

export default Permission;
