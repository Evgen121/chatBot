import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatBotEntity } from '@db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class DomainGuard implements CanActivate {
	constructor(
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>
	) {}

	async canActivate(context: ExecutionContext): Promise<any> {
		const allowedDomains = [
			'chatbot-generator.coderfy.com',
			'aista-back.coderfy.com',
		];

		const request = context.switchToHttp().getRequest();
		const originHeader =
			request.headers['origin'] || request.headers['referer'];

		const chatbotId = request.query.chatbotId;

		const cleanOriginDomain = originHeader?.replace(
			/^(https?:\/\/)?(www\.)?/,
			''
		);

		const cleanedOriginWithoutTrailingSlash: string =
			cleanOriginDomain?.replace(/\/$/, '');

		const chatbotFromDB = await this.chatBotRepository.findOne({
			where: { id: chatbotId },
		});

		const domainChat = chatbotFromDB.domain;

		const cleanDomainChatBoT = domainChat?.replace(
			/^(https?:\/\/)?(www\.)?/,
			''
		);

		const cleanedChatbotWithoutTrailingSlash = cleanDomainChatBoT?.replace(
			/\/$/,
			''
		);

		if (
			cleanedOriginWithoutTrailingSlash == cleanedChatbotWithoutTrailingSlash ||
			allowedDomains.includes(cleanedOriginWithoutTrailingSlash)
		) {
			return true;
		} else {
			return false;
		}
	}
}
