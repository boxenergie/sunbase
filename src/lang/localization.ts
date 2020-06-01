/*
 * localization.ts
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

import * as path from 'path';
const { readdir, readFile } = require('fs').promises;

import FlashMessages from '../utils/flash-messages';
import logger from '../utils/logger';

const langData: { [lang: string]: { [key: string]: string } } = {};

export async function init() {
	const files = await readdir(__dirname);

	await Promise.all(
		files.map(async (file: string) => {
			const splits = file.split('.');
			if (splits.length == 2 && splits[1] === 'json') {
				const data = await readFile(path.join(__dirname, file), {
					encoding: 'utf-8',
				});
				langData[splits[0]] = JSON.parse(data);
			}
		})
	);

	if (Object.entries(langData).length === 0) {
		throw new Error('No valid language data found');
	}
}

export function getSupportedLocales() {
	return Object.keys(langData);
}

export function localizeFlash(lang: string, msg: FlashMessages): string {
	const translationKey = `flash.${FlashMessages[msg].toLowerCase()}`;
	const ret            = langData[lang][translationKey];
	
	if (!ret) {
		logger.warn('No translation available for ' + msg);
		return lang === 'en' ? translationKey : localizeFlash('en', msg);
	}
	return ret;
}
