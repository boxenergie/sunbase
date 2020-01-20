import MongoClient from '../db/mongodb';
import { Document, Schema } from 'mongoose';

export interface UserData extends Document {
	username: string;
	password: string;
	role: string;
}

const userSchema = new Schema<UserData>({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, required: true, default: 'user' }
});

export default MongoClient.model<UserData>('User', userSchema);