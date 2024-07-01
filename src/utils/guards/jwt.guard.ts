import {
	ExecutionContext,
	Injectable,
	CanActivate,
	UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@db/entities';
import { Repository } from 'typeorm';
import { TokenService } from '@modules/shared/services/token.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly tokenService: TokenService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const roles: Record<string, boolean> = this.reflector.get<
			Record<string, boolean>
		>('roles', context.getHandler());
		const request = context.switchToHttp().getRequest();
		const jwtToken = request.headers.authorization;
		try {
			const res = this.tokenService.verifyToken(jwtToken);
			const user = await this.usersRepository.findOne({
				where: { id: res.user.id },
				relations: ['role'],
			});
			request.user = user;
			if (!user) {
				throw new UnauthorizedException('User not found');
			} else if (user.isBlocked) {
				throw new UnauthorizedException('User is blocked');
			} else if (!user.isEmailConfirmed) {
				throw new UnauthorizedException('Please confirm your email');
			}

			if (!roles || Object.keys(roles).length < 1) {
				return true;
			} else {
				return roles[user.role.id];
			}
		} catch (e) {
			throw new UnauthorizedException('Invalid token');
		}
	}
}
