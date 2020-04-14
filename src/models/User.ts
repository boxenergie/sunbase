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
import { Model } from 'models';
import { Document, Schema, Types } from 'mongoose';

import { permissionSchema, isPermissionType } from './Permission';
import MongoClient from '../db/mongodb';
import logger from '../utils/logger';
import Session from '../models/Session';

export interface UserDocument extends Model.User, Document {
	/**
	 * Compare a non-hashed password to the current hashed
	 * password of the user.
	 * @param password being the non-hashed password.
	 */
	comparePassword(password: string): boolean;

	/**
	 * Returns true if this user was granted a permission of the given type by another user
	 * @param grantedId the id of a user that may have granted a permission to this user
	 * @param type the type of permission to check
	 */
	hasPermissionFrom(grantedId: string, type: Model.Permission.Type): boolean;

	/**
	 * Grants a permission to a user
	 * @param user the user to grant the permission to
	 * @param type the type of permission to grant
	 */
	grantPermissionTo(user: UserDocument, type: Model.Permission.Type): Promise<unknown>;

	/**
	 * Revokes a permission from a user
	 * @param user the user to revoke the permission from
	 * @param type the type of permission to revoke
	 */
	revokePermissionFrom(user: UserDocument, type: Model.Permission.Type): Promise<unknown>;

	/**
	 * Disconnect the user from all the devices.
	 */
	disconnectFromAllDevices(cb: (err: any) => void): void;
}

const userSchema = new Schema<UserDocument>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true, default: 'user' },
	permissions: permissionSchema
});

userSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

userSchema.methods.hasPermissionFrom = function (granter: string, permissionType) {
	if (isPermissionType(permissionType)) {
		return (this.permissions.granted.get(granter)?.indexOf(permissionType) ?? -1) >= 0;
	}
	return false;
};

userSchema.methods.disconnectFromAllDevices = function (cb: (err: any) => void) {
	Session.deleteMany({ session: { $regex: `.*"user":"${this._id}".*` } }, cb);
};

userSchema.methods.grantPermissionTo = function(user, permissionType) {
	if (isPermissionType(permissionType)) {
		const granting = new Set(this.permissions.granting.get(user.id));
		granting.add(permissionType);
		this.permissions.granting.set(user.id, [...granting]);

		const granted = new Set(user.permissions.granted.get(this.id));
		granted.add(permissionType);
		user.permissions.granted.set(this.id, [...granting]);
		return Promise.all([this.save(), user.save()]);
	}
	return Promise.reject(`${permissionType} is not a valid permission`);
};

userSchema.methods.revokePermissionFrom = function (user, permissionType) {
	if (isPermissionType(permissionType)) {
		removePermRef(this.permissions.granting, user.id, permissionType);
		removePermRef(user.permissions.granted, this.id, permissionType);
		return Promise.all([this.save(), user.save()]);
	}
	return Promise.reject(`${permissionType} is not a valid permission`);
};

userSchema.pre('save', function(next) {
	const self = this as UserDocument;

	if (!self.permissions) {
		self.permissions = {granted: new Map(), granting: new Map(), resolveForDisplay: permissionSchema.methods.resolveForDisplay};
	}
	// If the user is being created or changed, we hash the password
    if(self.isModified('password')) {
		self.password = bcrypt.hashSync(self.password, 10);
	}
	
    next();
});

userSchema.pre('deleteOne', async function(next) {
	const self = this as UserDocument;
	try {
		await removeAllPermRefs(self, p => p.granted, p => p.granting);
		await removeAllPermRefs(self, p => p.granting, p => p.granted);
	} catch (err) {
		logger.error(`Failed to remove references to a deleted user: ${err.message}`);
	}

	next();
});

/**
 * Removes references to a user in a permission row
 * @param permRow the permission row being updated
 * @param referencedId a user ID to remove from the permission data
 * @param permissionType the permission type to remove
 */
function removePermRef(
	permRow: Model.Permission.Row,
	referencedId: string,
	permissionType: Model.Permission.Type,
) {
	const permTypes = permRow.get(referencedId);
	if (permTypes) {
		let i = permTypes.indexOf(permissionType);
		// In case of multiple elements in the array (bug or manual edit), remove all
		while (i >= 0) {
			permTypes.splice(i, 1);
			i = permTypes.indexOf(permissionType);
		}
		if (permTypes.length > 0) {
			permRow.set(referencedId, permTypes);
		} else {
			permRow.delete(referencedId);
		}
	}
}

function removeAllPermRefs(
	self: UserDocument,
	selfRowGetter: (data: Model.Permission.Data) => Model.Permission.Row,
	otherRowGetter: (data: Model.Permission.Data) => Model.Permission.Row
): Promise<void> {
	// promise waiting for the iteration to end
	return new Promise((resolve, reject) => {
		// Iterate over all referenced users
		const cursor = User.find({ _id: { $in: [...selfRowGetter(self.permissions).keys()].map(Types.ObjectId) } }).cursor();
		cursor.on('data', function (user: UserDocument) {
			otherRowGetter(user.permissions).delete(self.id);
		});
		cursor.on('close', resolve);
		cursor.on('error', reject);
	});
}

const User = MongoClient.model<UserDocument>('User', userSchema);
export default User;
