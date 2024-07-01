export enum UserErrors {
	USER_EXIST = 'User with this email already exist',
	INVALID_USER_ID = 'Invalid userId',
	USER_NOT_EXISTS = 'User with this email not exist',
	USER_NOT_FOUND = 'User not found',
	USER_BLOCKED = 'User is blocked contact support',
	UPDATE_USER_FAILED = 'User update failed',
	DELETE_USER_FAILED = 'Failed to delete user',
	SUBSCRIPTION_EXPIRED = 'Subscription expired',
	REFRESH_TOKEN_FAILED = 'Failed to refresh token your token is invalid',
	DUBLICATE_LEAD = 'Lead with email already exists. Skipping...',
	WRONG_DATA = 'Wrong data',
	INVALID_TOKEN = 'Invalid token',
}
