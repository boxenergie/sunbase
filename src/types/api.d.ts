declare namespace Express {
	export interface Response {
		api(body?: Object | string): void;
	}
}
