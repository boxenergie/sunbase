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
