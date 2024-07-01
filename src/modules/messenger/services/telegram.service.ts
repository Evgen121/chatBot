import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessengerBotEntity } from '@db/entities';
import { AistaService } from '@modules/shared/services/aista.service';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { Repository } from 'typeorm';

@Injectable()
export class TelegramBotService {
	constructor(
		private readonly aistaService: AistaService,
		@InjectRepository(MessengerBotEntity)
		private readonly messengerBotRepository: Repository<MessengerBotEntity>
	) {
		this.logger = new Logger(TelegramBotService.name);
	}

	private readonly logger: Logger;

	async startBots() {
		const messengerBots = await this.messengerBotRepository.find({
			where: {
				messenger: 'telegram',
			},
			relations: ['user', 'chatbot'],
		});

		messengerBots.map((messengerBot) => {
			this.startBot(messengerBot).catch((reason) => {
				this.logger.error(
					'Bot ' + messengerBot?.chatbot?.name + ' not started. ' + reason
				);
			});
		});

		this.logger.log(`Starting ${messengerBots.length} telegram bots`);
	}

	async startBot(messengerBot: MessengerBotEntity) {
		const bot = new Telegraf(messengerBot.botToken);

		bot.catch((error) => {
			this.logger.error(
				'Bot ' + messengerBot?.chatbot?.name + ' not started. ' + error
			);
		});

		bot.on(message('text'), async (ctx) => {
			const reply = await ctx.reply('...');
			try {
				const answer = await this.aistaService.askAistaOpenAI({
					prompt: ctx.message.text,
					references: false,
					type: messengerBot.chatbot.name,
				});

				ctx.telegram.editMessageText(
					reply.chat.id,
					reply.message_id,
					null,
					answer.result
				);
			} catch {
				ctx.telegram.editMessageText(
					reply.chat.id,
					reply.message_id,
					null,
					'An error occurred. Please try again later'
				);
			}
		});

		bot.launch().catch((error) => {
			this.logger.error(
				'Bot ' + messengerBot?.chatbot?.name + ' not started. ' + error
			);
		});
		messengerBot.isActive = true;
		this.messengerBotRepository.save(messengerBot);
	}

	async stopBots() {
		const bots = await this.messengerBotRepository.find({
			where: {
				messenger: 'telegram',
			},
		});
		bots.map((bot) => this.stopBot(bot));
	}

	async stopBot(messengerBot: MessengerBotEntity) {
		const bot = new Telegraf(messengerBot.botToken);
		bot.stop();
		messengerBot.isActive = false;
		await this.messengerBotRepository.save(messengerBot);
	}
}
