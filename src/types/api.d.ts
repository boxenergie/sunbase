import { UserData } from '../models/User';

declare global {
	namespace Express {
		interface Response {
			api(body?: Object | string): void;
		}

		interface User extends UserData {}
	}
}