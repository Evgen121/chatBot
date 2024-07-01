import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { ErrorMessages } from '@utils/errors/errors';
import { RoleEntity, UserEntity } from '@db/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/CreateUserDto';
import { UserDto } from './dto/UserDto';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		@InjectRepository(RoleEntity)
		private readonly roleRepository: Repository<RoleEntity>
	) {}

	async createUser(dto: CreateUserDto): Promise<UserDto> {
		const existUser = await this.usersRepository.findOne({
			where: { email: dto.email },
		});
		if (existUser) {
			throw new ConflictException(ErrorMessages.user.USER_EXIST);
		}

		dto.salt = await bcrypt.genSalt(10);
		dto.password = await bcrypt.hash(dto.password + dto.salt, 10);

		const role = await this.roleRepository.findOne({
			where: { name: 'user' },
		});
		await this.usersRepository.save({ ...dto, role });

		const user = await this.usersRepository.findOne({
			where: { email: dto.email },
		});

		return new UserDto(user);
	}

	async publicUser(email: string): Promise<UserDto> {
		const user = await this.usersRepository.findOne({
			where: { email },
			relations: ['role'],
		});
		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		return new UserDto(user);
	}

	async updateUser(email: string, dto: UpdateUserDto): Promise<void> {
		const userToUpdate = await this.usersRepository.findOne({
			where: { email },
			select: {
				password: true,
				salt: true,
			},
		});

		if (!userToUpdate) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		if (dto.password) {
			const salt = userToUpdate.salt;
			dto.password = await bcrypt.hash(dto.password + salt, 10);
		}

		await this.usersRepository.update({ email }, dto);
	}

	async updatePassword(email: string, password: string): Promise<void> {
		const user = await this.usersRepository.findOne({
			where: { email },
			select: {
				salt: true,
				id: true,
			},
		});

		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		const salt = user.salt;
		const newPassword = await bcrypt.hash(password + salt, 10);

		await this.usersRepository.update(
			{ id: user.id },
			{ password: newPassword }
		);
	}

	async deleteUser(email: string): Promise<void> {
		const { affected } = await this.usersRepository.delete({
			email,
		});
		if (!affected) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
	}
	async findOneById(id: number): Promise<UserEntity> {
		const user = await this.usersRepository.findOneBy({ id });
		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
		return user;
	}
}
