/*
 * passport.ts
 * Copyright (C) Sunshare 2019
 * This file is part of Sunbase.
 * Sunbase is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * Sunbase is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * You should have received a copy of the GNU Affero General Public License
 * along with Sunbase. If not, see <http://www.gnu.org/licenses/>.
 */

import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import User, { IUser } from '../models/User';

export const setup = (passport: PassportStatic) => {
	passport.serializeUser((user: IUser, done: Function) => {
		done(null, user._id);
	});
	  
	passport.deserializeUser((id: Number, done: Function) => {
		User.findById(id, (err, user: IUser) => {
			done(err, user);
		  });
	});
	  
	passport.use(new LocalStrategy(
		(username: String, password: String, done: Function) => {
			User.findOne({ username: username}, (err, user: IUser) => {
				if (err) return done(err);
				if (!user) return done(null, false);
				if (user.password != password) return done(null, false);
				
				return done(null, user);
				});
		}
	));
};
