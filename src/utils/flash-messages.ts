/*
 * flash-messages.ts
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

enum FlashMessages {
	INTERNAL_ERROR,

	/* authentication */
	// error
	MISSING_FIELD,
	WRONG_PASSWORD,
	EMAIL_EXISTS,
	USERNAME_EXISTS,
	MISMATCHING_PASSWORDS,
	UNAVAILABLE_CREDENTIALS,
	INVALID_CREDENTIALS,
	// success
	EMAIL_CHANGED,
	USERNAME_CHANGED,
	PASSWORD_CHANGED,

	/* adding raspberries */
	// error
	INVALID_RASPBERRY_INDEX,
	TOO_MANY_CANDIDATES,
	UNRECOGNIZED_MAC,
	INVALID_AUTH_FIELD,
	ALREADY_LINKED,
	// success
	RASPBERRY_LINKED,

	/* user deletion */
	// error
	SELF_DELETION,
	USER_NOT_FOUND,
	NOT_RASPBERRY,
	INVALID_RASPBERRY,
	// success
	USER_DELETED,
	RASPBERRY_DELETED,

	/* permissions */
	// error
	MISSING_USERNAME,
	SELF_PERMISSION,
	NO_READ_ACCESS,
	REVOCATION_ERROR,
	// success
	PERMISSION_GRANTED,
	PERMISSION_REVOKED,
	SELF_PERMISSION_REVOKED,
}

export default FlashMessages;
