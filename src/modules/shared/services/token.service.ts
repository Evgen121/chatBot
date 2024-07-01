import {
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@db/entities';
import { ErrorMessages } from '@utils/errors/errors';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {}

	async generateJwtToken(user: any) {
		const payload = { user };
		return this.jwtService.sign(payload, {
			secret: this.configService.get('jwt.secret_jwt'),
			expiresIn: this.configService.get('jwt.expire_jwt'),
		});
	}

	verifyToken(jwtToken: string) {
		jwtToken = jwtToken.replace('Bearer ', '');
		return this.jwtService.verify(jwtToken, {
			secret: process.env.SECRET,
		});
	}

	async refreshToken(token: string) {
		let decoded: any;

		try {
			decoded = this.jwtService.verify(token, {
				secret: this.configService.get('jwt.secret_jwt'),
				ignoreExpiration: true,
			});
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.user.REFRESH_TOKEN_FAILED
			);
		}
		const user = decoded?.user as Partial<UserEntity>;

		const userFromDB = await this.usersRepository.findOne({
			where: { id: user?.id },
			relations: {
				role: true,
			},
		});

		if (!userFromDB) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		if (userFromDB?.isBlocked) {
			throw new ForbiddenException(ErrorMessages.user.USER_BLOCKED);
		}

		const newJWT = this.jwtService.sign(
			{ user: userFromDB },
			{
				secret: this.configService.get('jwt.secret_jwt'),
				expiresIn: this.configService.get('jwt.expire_jwt'),
			}
		);

		return { token: newJWT };
	}
}
