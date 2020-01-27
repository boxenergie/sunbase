import { PassportStatic } from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import User, { UserData } from '../models/User';

export default (passport: PassportStatic) => {
	passport.serializeUser((user: UserData, done: Function) => {
		done(null, user._id);
	});
	  
	passport.deserializeUser((id: Number, done: Function) => {
		User.findById(id, (err, user: UserData) => {
			done(err, user);
		  });
	});
	  
	passport.use(new LocalStrategy(
		(username: String, password: String, done: Function) => {
			User.findOne({ username: username}, (err, user: UserData) => {
				if (err) return done(err);
				if (!user) return done(null, false);
				if (user.password != password) return done(null, false);
				
				return done(null, user);
				});
		}
	));
};
