/*
 * models.d.ts
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

import { ObjectId } from 'mongodb';

export namespace Model {
	interface User {
		username: string;
		password: string;
		role: 'user' | 'admin' | 'raspberry';
		permissions: Permission.Data;
		raspberry?: Raspberry;
	}

	interface Raspberry {
		label: string,
		mac: string,
		owner: ObjectId,
	}

	namespace Permission {
		enum Type {
			// Must add to Permission$isPermissionType too
			READ = "read",
			AGGREGATE = "aggregate"
		}
	
		type Row = Map<string, Type[]>;
		type ResolvedRow = { [permissionType: string]: string[] };
		type ResolvedPermissionData = {
			granted: ResolvedRow;
			granting: ResolvedRow;
		};
		
		interface Data {
			granting: Row;
			granted: Row;
	
			resolveForDisplay(): Promise<ResolvedPermissionData>;
		}
	}
}
