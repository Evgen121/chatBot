import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { RoleEntity, UserEntity } from '@db/entities';
import { Repository } from 'typeorm';

import { TestDataSource } from '@db/testDataSource';
import { UserService } from './user.service';
import { createMockUser } from '@/test/mocks/user.mock';
import * as bcrypt from 'bcrypt';

describe('UserService', () => {
	let userService: UserService;
	let userRepository: Repository<UserEntity>;

	let mockUser;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot(TestDataSource.options),
				TypeOrmModule.forFeature([UserEntity, RoleEntity]),
			],
			providers: [UserService],
		}).compile();
		userService = module.get<UserService>(UserService);
		userRepository = module.get<Repository<UserEntity>>(
			getRepositoryToken(UserEntity)
		);
		await userRepository.delete({});
	});

	beforeEach(async () => {
		mockUser = await createMockUser();
		await userRepository.save(mockUser);
	});

	describe('createUser', () => {
		it('should create user', async () => {
			const userToCreate = await createMockUser();
			const user = await userService.createUser(userToCreate);
			expect(user.email).toEqual(userToCreate.email);
			expect(user.authProvider).toEqual(userToCreate.authProvider);
			expect(user['password']).toBeUndefined();
			expect(user['salt']).toBeUndefined();
		});
	});

	describe('publicUser', () => {
		it('should return public user', async () => {
			const user = await userService.publicUser(mockUser.email);
			expect(user.email).toEqual(mockUser.email);
		});
	});

	describe('updateUser', () => {
		it('should update user', async () => {
			await userService.updateUser(mockUser.email, {
				surname: 'test',
				password: 'test',
				username: 'test',
			});

			const user = await userRepository.findOne({
				where: {
					email: mockUser.email,
				},
				select: {
					username: true,
					surname: true,
					password: true,
					salt: true,
				},
			});

			expect(user.surname).toEqual('test');
			expect(user.username).toEqual('test');
			expect(await bcrypt.compare('test' + user.salt, user.password)).toEqual(
				true
			);
		});
	});
});
