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

import * as apiControllerV1 from './api-v1';
import $ from '../../utils/error-handler';
import { localAuth } from '../../utils/route-auth';

// Default path: '/api'
const R = Router();
const R_V1 = Router().all('/v1', $(apiControllerV1.getApiFunction));

R_V1.get('/v1',  $(apiControllerV1.getApiInfo));

R_V1.route('/v1/energy')
	.get( $(apiControllerV1.getAllEnergyRecords))
	.post(localAuth({ session: false }),  $(apiControllerV1.addEnergyRecord));

R_V1.route('/v1/wind')
	.get( $(apiControllerV1.getAllWindRecords))
	.post(localAuth({ session: false }),  $(apiControllerV1.addWindRecord));

R.use(R_V1);
export default R;
