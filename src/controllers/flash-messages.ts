enum FlashMessages {
	/* authentication */
	// error
	MISSING_FIELD = 'One or more fields were not provided.',
	WRONG_PASSWORD = 'Wrong password',
	USERNAME_EXISTS = 'Username already exists.',
	MISMATCHING_PASSWORDS = 'New passwords must match.',
	UNAVAILABLE_USERNAME = 'Username "%s" is not available.',
	// success
	USERNAME_CHANGED = 'Username changed.',
	PASSWORD_CHANGED = 'Password changed.',

	/* adding raspberries */
	// error
	INVALID_RASPBERRY_INDEX = 'Your withdrawal index is invalid.',
	TOO_MANY_CANDIDATES = 'Please retry in 1h.',
	UNRECOGNIZED_MAC = 'This MAC is not registered in the system.',
	INVALID_AUTH_FIELD = 'Please respect the rules for the %s field.',
	ALREADY_LINKED = 'This raspberry is already linked to an account !',
	// success
	RASPBERRY_LINKED = `
				Successfully linked your raspberry to your account !<br>
				You can connect manage this raspberry by connecting to the following account:<br>
				<u>Username:</u> <i>%s/%s</i><br>
				<u>Password:</u> The one you specified
			`,

	/* user deletion */
	// error
	SELF_DELETION = 'You cannot delete yourself.',
	USER_NOT_FOUND = 'Unknown user: %s.',
	NOT_RASPBERRY = 'You can only delete a raspberry account.',
	INVALID_RASPBERRY = 'You cannot delete a raspberry you did not create.',
	// success
	USER_DELETED = 'User deleted.',
	RASPBERRY_DELETED = 'Raspberry unlinked.',

	/* permissions */
	// error
	MISSING_USERNAME = 'Please enter a username',
	SELF_PERMISSION = 'You cannot grant a permission to yourself.',
	NO_READ_ACCESS = 'No read access',
	REVOCATION_ERROR = 'Error while deleting permission:%s from: %s to: %s',
	// success
	PERMISSION_GRANTED = 'Permission granted.',
	PERMISSION_REVOKED = 'Removed permission %s from %s',
	SELF_PERMISSION_REVOKED = 'Removed permission %s from myself',

}

export function localize(msg: FlashMessages): string {
	// TODO actually localize
	return msg;
}

export default FlashMessages;
