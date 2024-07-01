import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatBotEntity, MessengerBotEntity } from '@db/entities';
import { Repository } from 'typeorm';

import { CreateMessengerBotDto } from './dto/CreateMessengerBotDto';
import { MessengerBotResponseDto } from './dto/MessengerBotResponseDto';
import { UpdateMessengerBotDto } from './dto/UpdateMessengerBotDto';
import { MessengerBotDto } from './dto/MessengerBotDto';
import { TelegramBotService } from './services/telegram.service';
import { ViberBotService } from './services/viber.service';

@Injectable()
export class MessengerService {
	constructor(
		private readonly telegramService: TelegramBotService,
		private readonly viberService: ViberBotService,
		@InjectRepository(MessengerBotEntity)
		private readonly messengerBotRepository: Repository<MessengerBotEntity>,
		@InjectRepository(ChatBotEntity)
		private readonly chatbotRepository: Repository<ChatBotEntity>
	) {}

	async initBots() {
		this.telegramService.startBots();
		this.viberService.startBots();
	}

	async destroyBots() {
		this.telegramService.stopBots();
		this.viberService.stopBots();
	}

	async getBots(query: any, userId: number) {
		const [bots, count] = await this.messengerBotRepository.findAndCount({
			where: {
				user: { id: userId },
			},
			relations: ['user', 'chatbot'],
		});

		return new MessengerBotResponseDto(bots, count);
	}

	async getOneBot(botId: number, userId: number) {
		const bot = await this.messengerBotRepository.findOne({
			where: {
				id: botId,
				user: { id: userId },
			},
			relations: ['user', 'chatbot'],
		});

		return new MessengerBotDto(bot);
	}

	async createBot(dto: CreateMessengerBotDto, userId: number) {
		const existingBot = await this.messengerBotRepository.findOne({
			where: {
				chatbot: {
					id: dto.chatbotId,
				},
				botToken: dto.botToken,
				messenger: dto.messenger,
			},
		});

		if (existingBot) {
			throw new BadRequestException('Bot already exist');
		}

		await this.messengerBotRepository.save({
			botToken: dto.botToken,
			messenger: dto.messenger,
			chatbot: { id: dto.chatbotId },
			user: { id: userId },
		});

		const bot = await this.messengerBotRepository.findOne({
			where: { chatbot: { id: dto.chatbotId } },
			relations: ['user', 'chatbot'],
		});

		await this.startBot(bot);
	}

	async updateBot(
		messengerBotId: number,
		dto: UpdateMessengerBotDto,
		userId: number
	) {
		const chatbot = await this.chatbotRepository.findOne({
			where: {
				user: { id: userId },
				id: dto.chatbotId,
			},
		});

		if (dto.chatbotId && !chatbot) {
			throw new NotFoundException(
				'Chatbot not found or other user is the owner'
			);
		}

		await this.messengerBotRepository.update(messengerBotId, {
			botToken: dto.botToken,
			chatbot: chatbot,
			messenger: dto.messenger,
		});
	}

	async deleteBot(telegramBotId: number, userId: number) {
		await this.messengerBotRepository.delete({
			id: telegramBotId,
			user: { id: userId },
		});
	}

	async startBot(bot: MessengerBotEntity) {
		if (bot.messenger == 'telegram') {
			await this.telegramService.startBot(bot);
		} else if (bot.messenger == 'viber') {
			await this.viberService.startBot(bot);
		}
	}
}
