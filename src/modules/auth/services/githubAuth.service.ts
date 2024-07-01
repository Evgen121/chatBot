import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';

import { TokenService } from '@shared/services/token.service';
import { UserEntity } from '@db/entities';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class GitHubAuthService {
	private readonly tokens: any;

	constructor(
		private readonly tokenService: TokenService,
		private readonly userService: UserService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {
		this.tokens = {
			content: {
				clientID: process.env.GITHUB_AUTH_CLIENT_ID_CONTENT,
				clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET_CONTENT,
				redirectUrl: process.env.GITHUB_AUTH_CALLBACK_REDIRECT_URL_CONTENT,
				scope: ['public_profile', 'user:email'],
			},
			chatbot: {
				clientID: process.env.GITHUB_AUTH_CLIENT_ID_CHATBOT,
				clientSecret: process.env.GITHUB_AUTH_CLIENT_SECRET_CHATBOT,
				redirectUrl: process.env.GITHUB_AUTH_CALLBACK_REDIRECT_URL_CHATBOT,
				scope: ['public_profile', 'user:email'],
			},
		};
	}

	private async validate(code: string, type: string) {
		const clientID: string = this.tokens[type]?.clientID;
		const clientSecret: string = this.tokens[type]?.clientSecret;

		if (!code) {
			return null;
		}

		try {
			const queryParams = `?client_id=${clientID}&client_secret=${clientSecret}&code=${code}&scope=${encodeURI(
				'user:email,public_profile'
			)}`;
			const response = await fetch(
				'https://github.com/login/oauth/access_token' + queryParams,
				{
					headers: {
						Accept: 'application/json',
					},
				}
			);

			const data = await response.json();

			const profile = await axios.get('https://api.github.com/user', {
				headers: {
					Authorization: 'token ' + data.access_token,
				},
			});
			const profileData = profile.data;

			const email = await axios.get('https://api.github.com/user/emails', {
				headers: {
					Authorization: 'token ' + data.access_token,
				},
			});

			const emailData = email.data;
			profileData.email = emailData?.find((item: any) => item.primary).email;

			const user = await this.getOrCreateUser(profileData);

			const token = await this.tokenService.generateJwtToken(user);

			return token;
		} catch {
			return null;
		}
	}

	async getRedirectUrl(type: string) {
		const client_id = this.tokens[type].clientID;
		const scope = this.tokens[type].scope.join(',');

		return `https://github.com/login/oauth/authorize?response_type=code&scope=${scope}&client_id=${client_id}`;
	}

	async getCallbackRedirectUrl(query: any, type: string) {
		const redirectUri: string = this.tokens[type].redirectUrl;

		if (query?.error) {
			return redirectUri;
		}

		const token = await this.validate(query.code, type);

		if (token) {
			return redirectUri + '/token/' + token;
		} else {
			return redirectUri + '/error';
		}
	}

	async getOrCreateUser(profile: any) {
		const user = await this.usersRepository.findOne({
			where: { email: profile.email },
			relations: ['role'],
		});

		if (user) {
			return user;
		} else {
			await this.usersRepository.save({
				authProvider: 'github',
				email: profile.email,
				username: profile.login,
				isEmailConfirmed: true,
				role: { id: 1 },
			});
			return await this.usersRepository.findOne({
				where: { email: profile.email },
				relations: ['role'],
			});
		}
	}
}
