import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessengerBotEntity } from '@db/entities';
import { Repository } from 'typeorm';
import axios from 'axios';
import { AistaService } from '@modules/shared/services/aista.service';

@Injectable()
export class WhatsAppService {
	private logger: Logger;

	constructor(
		private readonly aistaService: AistaService,
		@InjectRepository(MessengerBotEntity)
		private readonly messengerBotRepository: Repository<MessengerBotEntity>
	) {
		this.logger = new Logger(WhatsAppService.name);
	}

	async webhookHandler(body: any, botId: number) {
		if (!body?.entry[0]?.changes[0]?.value?.messages) {
			return;
		}

		const bot = await this.messengerBotRepository.findOne({
			where: {
				id: botId,
			},
			relations: ['user', 'chatbot'],
		});

		const phoneNumberId =
			body.entry[0].changes[0].value.metadata.phone_number_id;
		const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
		const to = body.entry[0].changes[0].value?.contacts[0].wa_id;

		const message = body?.entry[0]?.changes[0]?.value?.messages[0];
		const response = await this.aistaService.askAistaOpenAI({
			prompt: message.text.body,
			references: false,
			type: bot.chatbot.name,
		});

		axios
			.post(
				url,
				{
					messaging_product: 'whatsapp',
					to: to,
					type: 'text',
					text: {
						preview_url: true,
						body: response.result,
					},
				},
				{
					headers: {
						Authorization: `Bearer ${bot.botToken}`,
					},
				}
			)

			.catch((error) => {
				this.logger.error('Error sending message: ', error.response.data.error);
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
