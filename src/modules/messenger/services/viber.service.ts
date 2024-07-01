import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as Viber from 'viber-bot';

import { AistaService } from '@modules/shared/services/aista.service';
import { MessengerBotEntity } from '@db/entities';

@Injectable()
export class ViberBotService {
	constructor(
		private readonly aistaService: AistaService,
		@InjectRepository(MessengerBotEntity)
		private readonly messengerBotRepository: Repository<MessengerBotEntity>
	) {
		this.logger = new Logger(ViberBotService.name);
	}

	private readonly logger: Logger;

	async startBots() {
		const bots = await this.messengerBotRepository.find({
			where: {
				messenger: 'viber',
			},
			relations: ['user', 'chatbot'],
		});

		bots.map((bot) => this.startBot(bot));
		this.logger.log(`Starting ${bots.length} viber bots`);
	}

	async startBot(bot: MessengerBotEntity) {
		try {
			const viberBot = new Viber.Bot({
				authToken: bot.botToken,
				name: bot.chatbot.name,
				avatar: bot.chatbot.imageUrl,
			});

			const webhookUrl = process.env.VIBER_WEBHOOK_URL + bot.id;

			await viberBot.setWebhook(webhookUrl);

			bot.isActive = true;
			await this.messengerBotRepository.save(bot);
		} catch {
			this.logger.warn(`Start for viberbot ${bot.chatbot.name} failed`);
		}
	}

	async stopBots() {
		const bots = await this.messengerBotRepository.find({
			where: {
				messenger: 'viber',
			},
		});
		bots.forEach((bot) => (bot.isActive = false));
		await this.messengerBotRepository.save(bots);
	}

	async handleWebhook(botId, body) {
		const bot = await this.messengerBotRepository.findOne({
			where: {
				id: botId,
				messenger: 'viber',
			},
			relations: ['user', 'chatbot'],
		});

		let viberBot;
		try {
			viberBot = new Viber.Bot({
				authToken: bot.botToken,
				name: bot.chatbot.name,
				avatar: bot.chatbot.imageUrl,
			});
		} catch {
			this.logger.log(
				`Falied to create viber bot instance for bot ${bot?.chatbot?.name} with token`
			);
			return;
		}

		try {
			const response = await this.aistaService.askAistaOpenAI({
				prompt: body?.message?.text,
				references: false,
				type: bot.chatbot.name,
			});
			viberBot.sendMessage({ id: body?.sender?.id }, [
				new Viber.Message.Text(response.result),
			]);
		} catch {
			viberBot.sendMessage({ id: body?.sender?.id }, [
				new Viber.Message.Text('An error occurred. Please try again later'),
			]);
		}
	}
}
