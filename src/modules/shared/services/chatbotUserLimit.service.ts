import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MLRequest, MLTrainingSnippet, MLType } from '@db/aistaEnities';
import { ChatBotEntity, UserEntity } from '@db/entities';
import { ChatbotPlanService } from '@modules/plan/services/chatbotPlan.service';
import { In, MoreThanOrEqual, Repository } from 'typeorm';

@Injectable()
export class ChatbotUserLimitService {
	private readonly logger: Logger;
	private readonly DELETION_INTERVAL: number;

	constructor(
		@InjectRepository(MLRequest, 'aista')
		private readonly mlRequestRepository: Repository<MLRequest>,
		@InjectRepository(MLType, 'aista')
		private readonly mlTypeRepository: Repository<MLType>,
		@InjectRepository(MLTrainingSnippet, 'aista')
		private readonly mlTrainingSnippetRepository: Repository<MLTrainingSnippet>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		private readonly chatbotPlanService: ChatbotPlanService
	) {
		this.logger = new Logger(ChatbotUserLimitService.name);
		this.DELETION_INTERVAL = 5;
	}

	async limitUserRequests() {
		this.logger.log('Checking users chatbot limits');
		await this.countRequests();

		const users = await this.userRepository.find({
			where: {
				requestsCount: MoreThanOrEqual(5000),
			},
		});

		for (const user of users) {
			const subscriptionInfo =
				await this.chatbotPlanService.getChatbotSubscriptionInfo(
					user.subscriptionId
				);

			if (subscriptionInfo.requestsPerMonth <= user.requestsCount) {
				const chatbots = await this.chatBotRepository.find({
					where: {
						user: { id: user.id },
					},
				});

				for (const chatbot of chatbots) {
					chatbot.isActive = false;
					await this.chatBotRepository.save(chatbot);

					const mlType = await this.mlTypeRepository.findOne({
						where: {
							type: chatbot.name,
						},
					});

					if (mlType) {
						mlType.is_active = false;
						await this.mlTypeRepository.save(mlType);
					}
					this.logger.log(`Chatbot ${chatbot.name} is deactivated`);
				}
			}
		}
	}

	async limitUserSnippets() {
		this.logger.log('Checking users chatbot limits');
		await this.countSnippets();

		const users = await this.userRepository.find({
			where: {
				snippetsCount: MoreThanOrEqual(500),
			},
		});

		for (const user of users) {
			const subscriptionInfo =
				await this.chatbotPlanService.getChatbotSubscriptionInfo(
					user.subscriptionId
				);
			const snippetsAvailable = Number(subscriptionInfo.snippetsAvailable);

			if (snippetsAvailable < user.snippetsCount) {
				if (user.snippetsDeletionDate) {
					continue;
				} else {
					const deletionDate = new Date();
					deletionDate.setDate(new Date().getDate() + this.DELETION_INTERVAL);
					user.snippetsDeletionDate = deletionDate;

					await this.userRepository.save(user);
				}
			} else {
				if (user.snippetsDeletionDate) {
					user.snippetsDeletionDate = null;
					await this.userRepository.save(user);
				}
			}
		}
		await this.deleteSnippets();
	}

	async deleteSnippets() {
		this.logger.log('Deleting users snippets');

		const users = await this.userRepository.find({
			where: {
				snippetsDeletionDate: MoreThanOrEqual(new Date()),
			},
		});

		for (const user of users) {
			try {
				if (this.isDateToday(user.snippetsDeletionDate)) {
					const subscriptionInfo =
						await this.chatbotPlanService.getChatbotSubscriptionInfo(
							user.subscriptionId
						);
					const snippetsAvailable = Number(subscriptionInfo.snippetsAvailable);
					const take = user.snippetsCount - snippetsAvailable;

					if (take <= 0) {
						user.snippetsDeletionDate = null;
						this.userRepository.save(user);
						continue;
					}

					const chatbots = await this.chatBotRepository.find({
						where: {
							user: { id: user.id },
						},
					});

					const snippets = await this.mlTrainingSnippetRepository.find({
						where: {
							type: In(chatbots.map((chatbot) => chatbot.name)),
						},
						order: {
							created: 'DESC',
						},
						take: take,
					});

					this.mlTrainingSnippetRepository.remove(snippets);
					user.snippetsDeletionDate = null;
					this.userRepository.save(user);
					this.logger.log(
						`${take} snippets from user ${user.email} are deleted`
					);
				}
			} catch (e) {
				this.logger.error(e);
			}
		}
		this.countSnippets();
	}

	private isDateToday(date) {
		const givenDate = new Date(date);
		const today = new Date();

		return (
			givenDate.getDate() === today.getDate() &&
			givenDate.getMonth() === today.getMonth() &&
			givenDate.getFullYear() === today.getFullYear()
		);
	}

	private async countRequests() {
		this.logger.log('Counting requests');

		const query = `
        SELECT type, COUNT(type) 
        FROM ml_requests 
        WHERE EXTRACT(YEAR FROM created) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM created) = EXTRACT(MONTH FROM CURRENT_DATE)
        GROUP BY type;`;

		const requests = await this.mlRequestRepository.query(query);

		await this.userRepository.query(
			`UPDATE "public"."User" SET "requestsCount"=0;`
		);

		for (const request of requests) {
			try {
				const chatbot = await this.chatBotRepository.findOne({
					where: { name: request.type },
					relations: ['user'],
				});

				chatbot.user.requestsCount += Number(request.count);

				await this.userRepository.save(chatbot.user);
			} catch (e) {
				this.logger.error(e);
			}
		}
	}

	private async countSnippets() {
		this.logger.log('Counting snippets');

		const query = `
        SELECT type, COUNT(type) 
        FROM ml_training_snippets
        GROUP BY type;`;

		const snippets = await this.mlTrainingSnippetRepository.query(query);
		await this.userRepository.query(
			`UPDATE "public"."User" SET "snippetsCount"=0;`
		);

		for (const snippet of snippets) {
			try {
				const chatbot = await this.chatBotRepository.findOne({
					where: { name: snippet.type },
					relations: ['user'],
				});

				chatbot.user.snippetsCount += Number(snippet.count);

				await this.userRepository.save(chatbot.user);
			} catch (e) {
				this.logger.error(e);
			}
		}
	}
}
