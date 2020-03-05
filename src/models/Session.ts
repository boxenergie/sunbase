import { Schema } from 'mongoose';

import MongoClient from '../db/mongodb';

export default MongoClient.model('Session', new Schema(), 'sessions');