import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { UserEntity } from '@db/entities';
import { TokenService } from '@modules/shared/services/token.service';

@Injectable()
export class FacebookAuthService {
	private readonly tokens: any;

	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		private readonly tokenService: TokenService
	) {
		this.tokens = {
			clientId: process.env.FACEBOOK_AUTH_CLIENT_ID,
			clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET,
			callbackUrl: process.env.FACEBOOK_AUTH_CALLBACK_URL,
			scope: 'public_profile,email',
		};
	}

	getRedirectUrl(source: string) {
		return `https://www.facebook.com/v17.0/dialog/oauth?client_id=${this.tokens.clientId}&redirect_uri=${this.tokens.callbackUrl}&scope=${this.tokens.scope}&state=${source}`;
	}

	async getAccessToken(code: string) {
		const url = `https://graph.facebook.com/v17.0/oauth/access_token?client_id=${this.tokens.clientId}&redirect_uri=${this.tokens.callbackUrl}&client_secret=${this.tokens.clientSecret}&code=${code}`;
		const response = await axios.get(url);

		return response.data.access_token;
	}

	async getUserData(accessToken: string) {
		const url = `https://graph.facebook.com/v17.0/me?fields=email,name&access_token=${accessToken}`;
		const response = await axios.get(url);

		return response.data;
	}

	async getOrCreateUser(facebookUser: any) {
		const user = await this.usersRepository.findOne({
			where: { email: facebookUser.email },
			relations: ['role'],
		});

		if (user) {
			return user;
		} else if (!user && facebookUser.email) {
			await this.usersRepository.save({
				email: facebookUser.email,
				name: facebookUser.name,
				authProvider: 'facebook',
				isEmailConfirmed: true,
				role: { id: 1 },
			});

			return await this.usersRepository.findOne({
				where: { email: facebookUser.email },
				relations: ['role'],
			});
		}
	}

	async getCallbackRedirectUrl(user: UserEntity, source: string) {
		const token = await this.tokenService.generateJwtToken(user);
		return `${source}/token/${token}`;
	}
}
