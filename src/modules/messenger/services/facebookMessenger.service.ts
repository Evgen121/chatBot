import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';

import { MessengerBotEntity } from '@db/entities';
import { AistaService } from '@modules/shared/services/aista.service';

@Injectable()
export class FacebookMessengerSerivce {
	private logger: Logger;

	constructor(
		private readonly aistaService: AistaService,
		@InjectRepository(MessengerBotEntity)
		private readonly messengerBotRepository: Repository<MessengerBotEntity>
	) {
		this.logger = new Logger(FacebookMessengerSerivce.name);
	}

	async webhookHandler(body: any, botId: number) {
		const bot = await this.messengerBotRepository.findOne({
			where: { id: botId },
			relations: ['user', 'chatbot'],
		});

		const pageId = body.entry[0].id;
		const PAGE_ACCESS_TOKEN = bot.botToken;
		const BASE_URL = `https://graph.facebook.com/v17.0/${pageId}/messages`;

		const message = body.entry[0].messaging[0].message;
		const sender = body.entry[0].messaging[0].sender;

		const response = await this.aistaService.askAistaOpenAI({
			prompt: message.text,
			references: false,
			type: bot.chatbot.name,
		});

		const queryParams = {
			recipient: { id: sender.id },
			messaging_type: 'RESPONSE',
			access_token: PAGE_ACCESS_TOKEN,
			message: { text: response.result.slice(0, 1999) },
		};

		axios.post(`${BASE_URL}`, {}, { params: queryParams }).catch((error) => {
			this.logger.error('Error sending message:', error.response.data.error);
		});
	}

	async verifyWebhook(botId: number, query: any) {
		const bot = await this.messengerBotRepository.findOne({
			where: { id: botId },
		});
		if (bot.botToken !== query['hub.verify_token']) {
			throw new UnauthorizedException('Verification failed');
		} else {
			return query['hub.challenge'];
		}
	}
}
