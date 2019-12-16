import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import User, { IUser } from '../models/User';

export const setup = (passport: PassportStatic) => {
	passport.serializeUser((user: IUser, cb) => {
		cb(null, user.id);
	});
	  
	passport.deserializeUser((id, cb) => {
		User.findById(id, (err, user) => 	{
			cb(err, user);
		  });
	});
	  
	passport.use(new LocalStrategy(
		function(username: String, password: String, done: Function) {
			User.findOne({ username: username}, (err, user: IUser) => {
				if (err) return done(err);
				if (!user) return done(null, false);
				if (user.password != password) return done(null, false);
				
				return done(null, user);
				});
		}
	));
};
