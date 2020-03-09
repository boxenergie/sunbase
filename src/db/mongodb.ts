/*
 * mongodb.ts
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

import Mongoose from 'mongoose';

import app from '../app';
import logger from '../utils/logger';

Mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB_NAME}`,
	{
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true, // Make Mongoose's default index build use createIndex() instead of ensureIndex()
		connectTimeoutMS: 5000
	}
).catch((err: Mongoose.Error) => {
	logger.error(`Could NOT connect to MongoDB: ${err.message}`);
	process.exit(); // As MongoDB is mandotory for the server to work, exit the app if it doesn't work
});

const MongoClient = Mongoose.connection;
MongoClient.on('error', logger.error.bind(logger));
MongoClient.once('open', () => {
	logger.info('Succesfully connected to MongoDB');
	app.emit('ready'); // Tell the server to start
});

export default MongoClient;
