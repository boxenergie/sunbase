enum FlashMessages {
	/* authentication */
	// error
	MISSING_FIELD,
	WRONG_PASSWORD,
	USERNAME_EXISTS,
	MISMATCHING_PASSWORDS,
	UNAVAILABLE_USERNAME,
	// success
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