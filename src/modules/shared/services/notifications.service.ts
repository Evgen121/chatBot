import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { AistaService } from './aista.service';
import { EmailTemplate } from '@modules/email/emailTemplate.enum';
import {
	ChatBotEntity,
	ChatbotScriptRequestEntity,
	UserEntity,
} from '@db/entities';
import { AistaChatbotService } from '@modules/chatBot/services/aistaChatbot.service';
import { MLType } from '@db/aistaEnities';
import { SendEmailService } from '@modules/email/sendEmail.service';
import { UserService } from '../../user/user.service';

@Injectable()
export class NotificationService {
	constructor(
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		@InjectRepository(ChatbotScriptRequestEntity)
		private readonly chatbotScriptRequestRepository: Repository<ChatbotScriptRequestEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(MLType, 'aista')
		private readonly mlTypeRepository: Repository<MLType>,
		private readonly emailService: SendEmailService,
		private readonly aistaService: AistaService,
		private readonly aistaChatbotService: AistaChatbotService,
		private readonly userService: UserService
	) {}

	async expiredIn2DaysNotitfications() {
		const chatBots = await this.getChatBotsByDaysLeft(-2);
		this.sendEmail(chatBots, EmailTemplate.TwoDaysLeft);
	}

	async expiredBlockedNotifications() {
		const chatBots = await this.getChatBotsByDaysLeft(0);
		await this.sendEmail(chatBots, EmailTemplate.Blocked);
		for (const chatBot of chatBots) {
			chatBot.isActive = false;
			await this.chatBotRepository.save(chatBot);
			await this.aistaChatbotService.blockedAsset(chatBot.name);
			await this.mlTypeRepository.update(chatBot.name, { is_active: false });
		}
	}

	async expiredRemoveNotifications() {
		const chatBots = await this.getChatBotsByDaysLeft(14);
		await this.sendEmail(chatBots, EmailTemplate.Removed);
		for (const chatBot of chatBots) {
			await this.chatBotRepository.remove(chatBot);
			await this.aistaService.deleteAsset(chatBot.name);
			await this.aistaChatbotService.removedAsset(chatBot.name);
		}
	}

	async deleteLeadUser() {
		const twoMonthsAgo = new Date();
		twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

		const usersToDelete = await this.userRepository.find({
			where: {
				lastLoginDate: LessThan(twoMonthsAgo),
			},
		});

		for (const user of usersToDelete) {
			await this.userService.deleteUser(user.email);
		}
	}

	async benefits() {
		await this.processReminderEmails(3, 'Day_3');
	}

	async lastReminder() {
		await this.processReminderEmails(7, 'Day_7');
	}

	private async sendEmail(chatBots: ChatBotEntity[], template: EmailTemplate) {
		for (const chatBot of chatBots) {
			await this.emailService.sendEmailByTemplate(template, {
				name: chatBot.user.username,
				email: chatBot.user.email,
			});
		}
	}

	private async getChatBotsByDaysLeft(
		daysLeft: number
	): Promise<ChatBotEntity[]> {
		const expiryDate = new Date();
		expiryDate.setDate(expiryDate.getDate() + daysLeft);

		const users = await this.userRepository.find({
			where: {
				subscriptionDueDate: expiryDate,
			},
			relations: ['chatBots'],
		});

		const test = users.map((user) => user.chatBots).flat();

		return test;
	}

	private async processReminderEmails(
		daysAgo: number,
		emailType: 'Day_3' | 'Day_7'
	) {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const reminderDate = new Date(today);
		reminderDate.setDate(today.getDate() - daysAgo);

		const chatbots = await this.chatBotRepository
			.createQueryBuilder('chatbot')
			.where('DATE(chatbot.creationDate) = :reminderDate', {
				reminderDate: reminderDate.toISOString().split('T')[0],
			})
			.leftJoinAndSelect('chatbot.user', 'user')
			.getMany();
		for (const chatBot of chatbots) {
			const chatBotId = chatBot.id;

			const botScriptRequest = await this.chatbotScriptRequestRepository
				.createQueryBuilder('scriptRequest')
				.where('scriptRequest.chatBotId = :chatBotId', { chatBotId })
				.getOne();

			const user = await this.userRepository
				.createQueryBuilder('user')
				.where('user.id = :userId', { userId: chatBot.user.id })
				.leftJoinAndSelect('user.lead', 'lead')
				.getOne();

			if (user.lead && botScriptRequest === null) {
				const emailLanguage = user.lead?.language || 'en';
				const emailTemplate =
					emailLanguage === 'ua' && emailType === 'Day_3'
						? EmailTemplate.Day_3_UA
						: emailLanguage === 'ua' && emailType === 'Day_7'
						? EmailTemplate.Day_7_UA
						: emailType === 'Day_3'
						? EmailTemplate.Day_3_EN
						: EmailTemplate.Day_7_EN;

				await this.emailService.sendEmailByTemplate(emailTemplate, {
					email: user.email,
					username: user.lead?.firstName,
					surname: user.lead?.lastName,
				});
			}
		}
	}
}
