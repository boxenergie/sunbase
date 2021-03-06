/*
 * User.ts
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

import bcrypt from 'bcrypt';
import { Model } from 'models';
import { Document, Schema } from 'mongoose';

import { isPermissionType, permissionSchema } from './Permission';
import raspberrySchema from './Raspberry';
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

const isRaspberry = function () {
	// @ts-ignore
	this.role === 'raspberry';
};

const regexFlags = 'i';
const regexUsername = /[a-z0-9àâçéèêëîïôûùüÿñæœ \.\-_]{3,20}/;
const regexUsernameRaspberry = new RegExp(regexUsername.source + '/' + regexUsername.source);
const regexEmail = new RegExp(/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+.[a-zA-Z.]{2,15}/, regexFlags);
const validateUsername = function (v: string) {
	// @ts-ignore
	return this.role === 'raspberry'
		? new RegExp(`^${regexUsernameRaspberry.source}$`, regexFlags).test(v)
		: new RegExp(`^${regexUsername.source}$`, regexFlags).test(v);
};
const regexPassword = new RegExp(/^.{8,80}$/, regexFlags);

const userSchema = new Schema<UserDocument>({
	email   : { type: String, trim: true, required: !isRaspberry, unique: true, validate: regexEmail },
	username: {
		type    : String,
		trim    : true,
		required: true,
		unique  : true,
		validate: validateUsername,
	},
	password   : { type: String, trim: true, required: true, validate: regexPassword },
	role       : { type: String, required: true, default: 'user', enum: ['user', 'admin', 'raspberry'] },
	permissions: permissionSchema,
	raspberry  : {
		type: raspberrySchema,
		// Required only if role is 'raspberry'
		required: isRaspberry,
	},
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
	// @ts-ignore
	Session.deleteMany({ session: { $regex: `.*"user":"${this._id}".*` } }, cb);
};

userSchema.methods.grantPermissionTo = function (user, permissionType) {
	if (isPermissionType(permissionType)) {
		const granting = new Set(this.permissions.granting.get(user.id));
		granting.add(permissionType);
		this.permissions.granting.set(user.id, [...granting]);

		const granted = new Set(user.permissions.granted.get(this.id));
		granted.add(permissionType);
		user.permissions.granted.set(this.id, [...granted]);
		
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

userSchema.pre<UserDocument>('save', async function () {
	if (!this.permissions) {
		this.permissions = {
			granted          : new Map(),
			granting         : new Map(),
			resolveForDisplay: permissionSchema.methods.resolveForDisplay,
		};
	}

	// If the user is being created or changed, we hash the password
	if (this.isModified('password')) {
		this.password = bcrypt.hashSync(this.password, 10);
	}
});

// @ts-ignore
userSchema.post<UserDocument>('findOneAndDelete', async function (doc, next) {
	try {
		await removeAllPermRefs(
			doc,
			(p) => p.granting,
			(p) => p.granted
		);
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
	permRow       : Model.Permission.Row,
	referencedId  : string,
	permissionType: Model.Permission.Type
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
		}
		else {
			permRow.delete(referencedId);
		}
	}
}

async function removeAllPermRefs(
	self          : UserDocument,
	selfRowGetter : (data: Model.Permission.Data) => Model.Permission.Row,
	otherRowGetter: (data: Model.Permission.Data) => Model.Permission.Row
): Promise<void> {
	return new Promise((resolve, reject) => {
		// Iterate over all referenced users
		const cursor = User.find({
			_id: { $in: [...selfRowGetter(self.permissions).keys()] },
		}).cursor();
		cursor.on('data', function (user: UserDocument) {
			otherRowGetter(user.permissions).delete(`${self.id}`);
			user.save();
		});
		cursor.on('close', resolve);
		cursor.on('error', reject);
	});
}

const User = MongoClient.model<UserDocument>('User', userSchema);
export default User;
