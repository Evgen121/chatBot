import { MLRequest } from '@/src/db/aistaEnities';
import { ChatBotEntity, ChatbotScriptRequestEntity } from '@/src/db/entities';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
import { AnalyticsQueryDto } from './dto/AnalyticsQueryDto';
import { AnalyticsDto } from './dto/AnalyticsDto';
import { AnalitycsResponseDto } from './dto/AnalyticsResponseDto';
import { ChartQueryDto } from './dto/ChartQueryDto';

@Injectable()
export class ChatbotAnalyticsService {
	constructor(
		@InjectRepository(MLRequest, 'aista')
		private readonly mlRequestRepository: Repository<MLRequest>,
		@InjectRepository(ChatBotEntity)
		private readonly chatbotRepository: Repository<ChatBotEntity>,
		@InjectRepository(ChatbotScriptRequestEntity)
		private readonly chatbotScriptRequestRepository: Repository<ChatbotScriptRequestEntity>
	) {}
	async getAnalytics(query: AnalyticsQueryDto) {
		query = AnalyticsQueryDto.parse(query);
		const [chatbots, count] = await this.chatbotRepository.findAndCount({
			where: {
				name: query.name && ILike(`%${query.name}%`),
			},
		});
		const promises = chatbots.map((chatbot) => {
			return this.getAnalyticsByChatbotId(chatbot.id, query);
		});
		const analytics = await Promise.all(promises);

		if (query.sortKey) {
			analytics.sort((a, b) => a[query.sortKey] - b[query.sortKey]);
			if (query.order == 'ASC') {
				analytics.reverse();
			}
		}

		return new AnalitycsResponseDto(
			analytics.slice((query.page - 1) * query.limit, query.page * query.limit),
			count
		);
	}

	async triggerUntrack(chatbotIds: number[]) {
		chatbotIds;
	}

	private async getAnalyticsByChatbotId(
		chatBotId: number,
		query: AnalyticsQueryDto
	) {
		const chatbot = await this.chatbotRepository.findOne({
			where: { id: chatBotId },
		});

		const requestsCount = await this.mlRequestRepository.count({
			where: {
				type: chatbot.name,
				created: Between(query.from, query.to),
			},
		});

		const scriptRequestsCount = await this.chatbotScriptRequestRepository.count(
			{
				where: {
					chatBotId: chatBotId,
					requestDate: Between(query.from, query.to),
				},
			}
		);

		return new AnalyticsDto(chatbot, requestsCount, scriptRequestsCount);
	}

	async getChart(query: ChartQueryDto) {
		const queryBuilder = this.mlRequestRepository.createQueryBuilder('ml_type');

		const result = await queryBuilder
			.select(`DATE_TRUNC('${query.interval}', ml_type.created) as interval`)
			.addSelect('COUNT(*) as count')
			.groupBy('interval')
			.orderBy('interval', 'ASC')
			.getRawMany();

		return result;
	}
}
