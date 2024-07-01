import { UserEntity } from '../../src/db/entities';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export const createMockUser = async () => {
	const user = new UserEntity();
	user.username = faker.internet.userName();
	user.surname = faker.person.lastName();
	user.email = faker.internet.email();
	user.authProvider = faker.company.name();
	user.isBlocked = false;
	user.password =
		'$2b$10$2O5MLXxa2YFiYPLKYYe7U.jO7GdV8jiODFqI2jdnNl2gkVrxNWTJ2';
	user.salt = await bcrypt.genSalt(10);
	user.isEmailConfirmed = true;
	user.registerDate = faker.date.past();
	user.requestsCount = Math.floor(Math.random() * 10000);
	user.snippetsCount = Math.floor(Math.random() * 10000);

	return user;
};
