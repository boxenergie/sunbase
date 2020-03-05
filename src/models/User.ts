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
import { Document, Schema } from 'mongoose';
import { Model } from 'models';

import MongoClient from '../db/mongodb';
import Session from '../models/Session';

export interface UserDocument extends Model.User, Document {
	/**
	 * Compare a non-hashed password to the current hashed
	 * password of the user.
	 * @param password being the non-hashed password.
	 */
	comparePassword(password: string): boolean;

	/**
	 * Disconnect the user from all the devices.
	 */
	disconnectFromAllDevices(cb: (err: any) => void): void;
}

const userSchema = new Schema<UserDocument>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true, default: 'user' }
});

userSchema.methods.comparePassword = function (password) {
	return bcrypt.compareSync(password, this.password);
};

userSchema.methods.disconnectFromAllDevices = function (cb: (err: any) => void) {
	Session.deleteMany({ session: { $regex: `.*"user":"${this._id}".*` } }, cb);
};

userSchema.pre('save', function (next) {
	// If the user is not being created or changed, we skip over the hashing part
	let self = this as UserDocument;
	if (!self.isModified('password')) {
		return next();
	}

	self.password = bcrypt.hashSync(self.password, 10);
	next();
});

export default MongoClient.model<UserDocument>('User', userSchema);
