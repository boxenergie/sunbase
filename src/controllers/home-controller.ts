/*
 * home-controller.ts
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

import { NextFunction, Request, Response } from 'express';

import User, { UserDocument } from '../models/User';
import * as InfluxHelper from '../utils/influxHelper';
import logger from '../utils/logger';

async function gatherCommunityData(community: UserDocument) {
	const AGGREGATE = 'aggregate' as any;
	// The data producers (ie. energy boxes) in the community
	const dataSources = [];
	// All accounts having already been checked (avoids recursion, when 2 communities include each other)
	const checkedAccounts: string[] = [];
	// Accounts to check
	const accountsStack = [community.id];
	// Recursively gather community members (raspberry of user, user member of community, community member of community)
	while (accountsStack.length > 0) {
		// Assert there is at least one element in communitiesStack
		const accountId        = accountsStack.pop();
		const aggregateAccount = await User.findById(accountId);

		if (!aggregateAccount || checkedAccounts.includes(aggregateAccount.id)) {
			// Ao account with that id, or already checked. Skip.
			continue;
		}

		checkedAccounts.push(aggregateAccount.id);
		
		if (aggregateAccount.raspberry) {
			// Account is a source of records, assume not a community
			dataSources.push(aggregateAccount.raspberry.mac);
			continue;
		}

		// Gather users that gave the AGGREGATE permission to this community
		for (const [userId, perms] of aggregateAccount.permissions.granted) {
			if (perms.includes(AGGREGATE)) {
				accountsStack.push(userId);
			}
		}
	}

	const communityResult = await InfluxHelper.query(`SELECT MEAN(production) AS production,
								MEAN(consumption) AS consumption,
								MEAN(surplus) AS surplus
								FROM EnergyRecord
								WHERE (raspberry_mac =~ /(?i)^${dataSources.join(
									'$/ OR raspberry_mac =~ /(?i)^'
								)}$/)
								AND time >= now() - 1d
								AND time <= now()
								GROUP BY time(15m) fill(none)`);

	return {
		name: community.username,
		data: {
			time       : communityResult.rows.map((r: any) => r.time.toNanoISOString()),
			production : communityResult.rows.map((r: any) => r.production),
			consumption: communityResult.rows.map((r: any) => r.consumption),
			surplus    : communityResult.rows.map((r: any) => r.surplus),
		},
	};
}

export async function renderHomePage(req: Request, res: Response, next: NextFunction) {
	const globalResults = await InfluxHelper.query(
		`SELECT MEAN(production) AS production,
		MEAN(consumption) AS consumption,
		MEAN(surplus) AS surplus
		FROM EnergyRecord
		WHERE time >= now() - 1d
		AND time <= now()
		GROUP BY time(15m) fill(none)`
	);

	const communitiesData = [];

	// If user is authenticated
	if (req.user) {
		for (const [communityId, permissions] of req.user.permissions.granted.entries()) {
			const AGGREGATE = 'aggregate' as any;
			if (permissions.includes(AGGREGATE)) {
				const community = await User.findById(communityId);
				if (!community) {
					// No community with that id, skip
					continue;
				}
				communitiesData.push(await gatherCommunityData(community));
			}
		}
	}

	const userData = req.user
		? communitiesData.splice(0,1)[0].data
		:  { time: [], production: [], consumption: [], surplus: [] };

	res.render('home', {
		globalData: {
			time       : globalResults.rows.map((r: any) => r.time.toNanoISOString()),
			production : globalResults.rows.map((r: any) => r.production),
			consumption: globalResults.rows.map((r: any) => r.consumption),
			surplus    : globalResults.rows.map((r: any) => r.surplus),
		},
		userData,
		communitiesData,
		user: req.user,
	});
}
