import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from './notifications.service';
import { ChatbotUserLimitService } from './chatbotUserLimit.service';
import { PaymentService } from '@modules/payment/payment.service';
import { ChatBotService } from '../../chatBot/services/chatBot.service';

@Injectable()
export class TaskSchedulerService {
	constructor(
		private readonly notificationService: NotificationService,
		private readonly chatbotUserLimitService: ChatbotUserLimitService,

		private readonly chatbotService: ChatBotService,
		private readonly paymentService: PaymentService
	) {}

	@Cron(CronExpression.EVERY_DAY_AT_10PM)
	async expiredAllNotifications() {
		await Promise.all([
			this.notificationService.expiredIn2DaysNotitfications(),
			this.notificationService.expiredBlockedNotifications(),
			this.notificationService.expiredRemoveNotifications(),
			this.notificationService.benefits(),
			this.notificationService.lastReminder(),
		]);
	}

	@Cron(CronExpression.EVERY_DAY_AT_11AM)
	async limitUserRequests() {
		await this.chatbotUserLimitService.limitUserRequests();
	}

	@Cron(CronExpression.EVERY_DAY_AT_1PM)
	async limitUserSnippets() {
		await this.chatbotUserLimitService.limitUserSnippets();
	}

	@Cron(CronExpression.EVERY_DAY_AT_2PM)
	async updateSubscription() {
		await this.paymentService.updateSubscriptions();
	}

	@Cron('0 */3 * * * *')
	async createBotsForLeads() {
		await this.chatbotService.generateBotForOneLead();
	}
}
