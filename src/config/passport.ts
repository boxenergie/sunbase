/*
 * passport.ts
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

import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import User, { UserDocument } from '../models/User';

export default (passport: PassportStatic) => {
	passport.serializeUser((user: UserDocument, done: Function) => {
		done(null, user._id);
	});
	  
	passport.deserializeUser((id: Number, done: Function) => {
		User.findById(id, (err, user: UserDocument) => {
			done(err, user);
		  });
	});
	  
	passport.use(new LocalStrategy(
		(username: string, password: string, done: Function) => {
			User.findOne({ username: username}, (err, user: UserDocument) => {
				if (err) return done(err);
				if (!user) return done(null, false);
				if (!user.comparePassword(password)) return done(null, false);
				
				return done(null, user);
			});
		}
	));
};
