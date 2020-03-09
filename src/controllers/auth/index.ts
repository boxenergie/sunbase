/*
 * index.ts
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

import { Router } from 'express'
import rateLimit from '../../config/rate-limiter';

import * as authController from './login-controller';
import * as registerController from './register-controller';
import $ from '../../utils/error-handler';
import { isNotLoggedIn, isLoggedIn, localAuth } from '../../utils/route-auth';

// Default path: '/'
const R = Router();

R.route('/login')
	.get(isNotLoggedIn(), $(authController.renderLoginPage))
	.post(isNotLoggedIn(), rateLimit({ max: 10}), localAuth({
		failureRedirect: '/login',
		successRedirect:'/',
		failureFlash: 'Invalid username or password.'
	}));

R.route('/register')
	.get(isNotLoggedIn(), $(registerController.renderRegisterPage))
	.post(isNotLoggedIn(), rateLimit({ max: 10}), $(registerController.registerUser));

R.get('/logout', isLoggedIn(), $(authController.logOut))

export default R;
