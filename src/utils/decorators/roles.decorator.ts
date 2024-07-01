import { CustomDecorator, SetMetadata } from '@nestjs/common';

const allRoles = {
	user: 1,
	admin: 2,
};

export const Roles = (...roles: string[]): CustomDecorator<unknown> => {
	const definedRoles = roles.reduce(
		(acc: Record<string, boolean>, item: string) => {
			acc[allRoles[item]] = true;
			return acc;
		},
		{}
	);

	return SetMetadata<unknown>('roles', definedRoles);
};
