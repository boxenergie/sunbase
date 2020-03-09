/*
 * User.ts
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

import bcrypt from 'bcrypt';
import { Document as MongooseDocument, Schema as MongooseSchema, Types } from 'mongoose';

import Permission, { isPermission } from './Permission';
import MongoClient from '../db/mongodb';
import logger from '../utils/logger';
import Session from '../models/Session';
import Q from 'q';

export namespace User {
	export interface Interface {
		username: string;
		password: string;
		role: string;
		permissions: Permission.Interface;
	}

	export interface Document extends Interface, MongooseDocument {
		/**
		 * Compare a non-hashed password to the current hashed
		 * password of the user.
		 * @param password being the non-hashed password.
		 */
		comparePassword(password: string): Promise<unknown>;
	
		/**
		 * Returns true if this user was granted a permission of the given type by another user
		 * @param grantedId the id of a user that may have granted a permission to this user
		 * @param type the type of permission to check
		 */
		hasPermissionFrom(grantedId: string, type: Permission.Type): boolean;
	
		/**
		 * Grants a permission to a user
		 * @param user the user to grant the permission to
		 * @param type the type of permission to grant
		 */
		grantPermissionTo(user: Document, type: Permission.Type): Promise<unknown>;
	
		/**
		 * Revokes a permission from a user
		 * @param user the user to revoke the permission from
		 * @param type the type of permission to revoke
		 */
		revokePermissionFrom(user: Document, type: Permission.Type): Promise<unknown>;
	
		/**
		 * Disconnect the user from all the devices.
		 */
		disconnectFromAllDevices(): Promise<unknown>;
	}

	export const Schema = new MongooseSchema<Document>({
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		role: { type: String, required: true, default: 'user' },
		permissions: Permission.Schema
	});
	
	Schema.methods.comparePassword = async function (password) {
		const P = Q.defer();
		bcrypt.compare(password, this.password, P.makeNodeResolver());
		return P.promise;
	};
	
	Schema.methods.hasPermissionFrom = function (granter: string, permissionType) {
		return isPermission(permissionType) &&
			(this.permissions.granted.get(granter)?.indexOf(permissionType) ?? -1) >= 0;
	};
	
	Schema.methods.grantPermissionTo = function (user, permissionType) {
		if (isPermission(permissionType)) {
			const granting = new Set(this.permissions.granting.get(user.id));
			granting.add(permissionType);
			this.permissions.granting.set(user.id, [...granting]);
	
			const granted = new Set(user.permissions.granted.get(this.id));
			granted.add(permissionType);
			user.permissions.granted.set(this.id, [...granting]);
	
			return Promise.all([this.save(), user.save()]);
		}
	
		return Promise.reject();
	};
	
	Schema.methods.revokePermissionFrom = function (user, permissionType) {
		if (isPermission(permissionType)) {
			removePermRef(this.permissions.granting, user.id, permissionType);
			removePermRef(user.permissions.granted, this.id, permissionType);
	
			return Promise.all([this.save(), user.save()]);
		}
	
		return Promise.resolve();
	};
	
	Schema.methods.disconnectFromAllDevices = async function() {
		return Session.deleteMany({
			session: {
				$regex: `.*"user":"${this._id}".*`
			}
		})
		.exec();
	};
	
	Schema.pre('save', function(next) {
		const self = this as Document;
	
		if (!self.permissions) {
			self.permissions = {
				granted: new Map(),
				granting: new Map(),
				resolveForDisplay: Permission.Schema.methods.resolveForDisplay
			};
		}
		// If the user is being created or changed, we hash the password
		if(self.isModified('password')) {
			self.password = bcrypt.hashSync(self.password, 10);
		}
		
		next();
	});
	
	Schema.pre('deleteOne', async function(next) {
		// TODO Fix it
		const self = this as Document;
		try {
			await removeAllPermRefs(self, p => p.granted, p => p.granting);
			await removeAllPermRefs(self, p => p.granting, p => p.granted);
		} catch (err) {
			logger.error(`Failed to remove references to a deleted user: ${err.message}`);
		}
	
		next();
	});

	export const Model = MongoClient.model<Document>('User', Schema);
}

/**
 * Removes references to a user in a permission row
 * @param permRow the permission row being updated
 * @param referencedId a user ID to remove from the permission data
 * @param permissionType the permission type to remove
 */
function removePermRef(
	permRow: Permission.Row,
	referencedId: string,
	permissionType: Permission.Type,
) {
	const permTypes = permRow.get(referencedId);

	if (permTypes) {
		let i = permTypes.indexOf(permissionType);
		// In case of multiple elements in the array (bug or manual edit), remove all
		while (i >= 0) {
			permTypes.splice(i, 1);
			i = permTypes.indexOf(permissionType);
		}

		if (permTypes.length > 0)
			permRow.set(referencedId, permTypes);
		else
			permRow.delete(referencedId);
	}
}

function removeAllPermRefs(
	self: User.Document,
	selfRowGetter: (data: Permission.Interface) => Permission.Row,
	otherRowGetter: (data: Permission.Interface) => Permission.Row
): Promise<void> {
	// promise waiting for the iteration to end
	return new Promise((resolve, reject) => {
		// Iterate over all referenced users
		const cursor = User.Model.find({ _id: { $in: [...selfRowGetter(self.permissions).keys()].map(Types.ObjectId) } }).cursor();
		
		cursor.on('data', function (user: User.Document) {
			otherRowGetter(user.permissions).delete(self.id);
		});
		cursor.on('close', resolve);
		cursor.on('error', reject);
	});
}

export default User;
