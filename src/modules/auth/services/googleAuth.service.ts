import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { ErrorMessages } from '@utils/errors/errors';
import { TokenService } from '@shared/services/token.service';
import { UserService } from '@modules/user/user.service';
import { UserEntity } from '@db/entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleAuthDto } from '../dto/GoogleAuthDto';
import axios from 'axios';

@Injectable()
export class GoogleAuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {}

	async googleAuthLogin(payload: any) {
		if (!payload) {
			throw new BadRequestException(ErrorMessages.user.WRONG_DATA);
		}

		const user = await this.usersRepository.findOne({
			where: { email: payload.email },
		});

		if (!user) {
			await this.usersRepository.save({
				authProvider: 'google',
				email: payload.email,
				password: '',
				salt: '',
				username: payload.given_name,
				surname: payload.family_name,
				isEmailConfirmed: true,
				role: { id: 1 },
			});
		}

		const publicUser = await this.userService.publicUser(payload.email);
		const token = await this.tokenService.generateJwtToken(publicUser);

		return { user: publicUser, token: token };
	}

	async getAccessToken(dto: GoogleAuthDto) {
		try {
			const payload = await axios.get(
				'https://www.googleapis.com/oauth2//userinfo?access_token=' +
					dto.accessToken
			);
			return await this.googleAuthLogin(payload.data);
		} catch (e) {
			throw new HttpException(e.message, e.status);
		}
	}
}
