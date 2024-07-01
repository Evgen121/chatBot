import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '@db/entities';

@Injectable()
export class ContentGuard implements CanActivate {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();

		const user = request.user;

		if (!user) {
			return false;
		}

		const userFromDB = await this.usersRepository.findOne({
			where: { id: user.id },
			relations: ['role'],
		});

		if (!userFromDB) {
			return false;
		}

		if (userFromDB.role.name === 'admin') {
			return true;
		}

		if (userFromDB.contenterPoints <= 0) {
			return false;
		}

		return true;
	}
}
