import FlashMessages from "../controllers/flash-messages";
import * as util from "util";
import logger from "../utils/logger";
import * as path from "path";
const fs = require('fs');

const langData: {[lang: string]: {[key: string]}} = {}

export async function init() {
	const files = await util.promisify(fs.readdir)(__dirname);
	await Promise.all(files.map(async (file: string) => {
		const splits = file.split('.');
 		if (splits.length == 2 && splits[1] === 'json') {
			const data = await util.promisify(fs.readFile)(path.join(__dirname, file), {encoding: 'utf-8'});
			langData[splits[0]] = JSON.parse(data);
		}
	}));
	if (Object.entries(langData).length === 0) {
		throw new Error('No valid language data found');
	}
}

export function getSupportedLocales() {
	return Object.keys(langData);
}

export function localize(lang: string, msg: FlashMessages): string {
	const ret = langData[lang][FlashMessages[msg]];
	if (!ret) {
		logger.warn('No translation available for ' + msg);
		return lang === 'en' ? FlashMessages[msg] : localize('en', msg);
	}
	return ret;
}
