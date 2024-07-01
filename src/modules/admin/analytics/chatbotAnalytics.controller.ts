import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatbotAnalyticsService } from './chatbotAnalytics.service';
import { AnalyticsQueryDto } from './dto/AnalyticsQueryDto';
import { ChartQueryDto } from './dto/ChartQueryDto';

@Controller('admin/chatbot/analytics')
export class ChatBotAnalyticsController {
	constructor(
		private readonly chatbotAnalyticsService: ChatbotAnalyticsService
	) {}

	@Get()
	async getAnalytics(@Query() query: AnalyticsQueryDto) {
		return this.chatbotAnalyticsService.getAnalytics(query);
	}

	@Get('chart')
	async getChart(@Query() query: ChartQueryDto) {
		return await this.chatbotAnalyticsService.getChart(query);
	}

	@Post('untrack')
	async untrackBotsInAnalytics(@Body() body: number[]) {
		return await this.chatbotAnalyticsService.triggerUntrack(body);
	}
}
