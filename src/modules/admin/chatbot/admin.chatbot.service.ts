import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { UpdateBotDTO } from '@modules/shared/dto/aista.dto';
import { AistaService } from '@modules/shared/services/aista.service';
import { UserService } from '@modules/user/user.service';
import { ILike, Raw, Repository } from 'typeorm';
import { UploadService } from '@modules/shared/services/upload.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatbotPlanService } from '@modules/plan/services/chatbotPlan.service';
import { UsageStatisticsResponseDto } from '@modules/chatBot/dto/UsageStatisticsResponseDto';

import { SendEmailService } from '@modules/email/sendEmail.service';
import { ChatBotDto } from '@modules/chatBot/dto/ChatbotDto';
import {
	ChatBotEntity,
	CssStyleEntity,
	ScriptEntity,
	StructureEntity,
	UserEntity,
} from '@db/entities';
import { MLRequest, MLTrainingSnippet, MLType } from '@db/aistaEnities';
import { ErrorMessages } from '@utils/errors/errors';
import { UpdateChatbotDTO } from '@modules/chatBot/dto/UpdateChatbotDto';
import { ChatBotService } from '../../chatBot/services/chatBot.service';

@Injectable()
export class AdminChatBotService {
	private logger: Logger;

	constructor(
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		private readonly aistaService: AistaService,
		private readonly userService: UserService,
		private readonly chatbotService: ChatBotService,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		private readonly emailService: SendEmailService,
		private readonly uploadService: UploadService,
		@InjectRepository(ScriptEntity)
		private readonly scriptRepository: Repository<ScriptEntity>,
		@InjectRepository(StructureEntity)
		private readonly structureRepository: Repository<StructureEntity>,
		@InjectRepository(CssStyleEntity)
		private readonly styleCssRepository: Repository<CssStyleEntity>,
		@InjectRepository(MLType, 'aista')
		private readonly mlTypeRepository: Repository<MLType>,
		@InjectRepository(MLTrainingSnippet, 'aista')
		private readonly mlTrainingSnippet: Repository<MLTrainingSnippet>,
		@InjectRepository(MLRequest, 'aista')
		private readonly mlRequestRepository: Repository<MLRequest>,
		private readonly chatbotPlanService: ChatbotPlanService
	) {
		this.logger = new Logger(AdminChatBotService.name);
	}

	async createAsset(dto: ChatBotDto): Promise<ChatBotEntity> {
		const chatBot = {
			user: { id: dto.id },
			name: dto.domain
				.replace('https://', '')
				.replace('http://', '')
				.replace('.', '_'),
			domain: dto.domain,
			tone: dto.tone,
			structure: dto.structure,
			button: dto.button,
			askMe: dto.askMe,
			model: dto.model,
			styleCss: dto.styleCss,
			max: dto.max,
			autocrawl: dto.autocrawl,
		} as unknown as ChatBotEntity;

		const existingChatBot = await this.chatBotRepository.findOneBy({
			domain: dto.domain,
		});

		if (existingChatBot) {
			throw new ConflictException(ErrorMessages.chatbot.EXIST_DOMAIN);
		}
		if (!dto.script) {
			const staticScript = await this.scriptRepository.find();
			if (staticScript.length > 0) {
				const firstScriptId = staticScript[0].id;
				chatBot.script = new ScriptEntity();
				chatBot.script.id = firstScriptId;
			}
		}

		const existDomain = await this.aistaService.createAsset({
			url: dto.domain,
			flavor:
				dto.tone ||
				`We are going to play a role game. You are Jane, a sales executive for the company in the context, \n and every opportunity you have, you will recommend relevant products from your employer. You will answer all my questions\n with information found in the context specified in the next message, while preserving relevant markdown, such as hyperlinks\nand images, in addition to adding emojis where it makes sense. If you cannot find the answer to the question in the context,\n answer "I am sorry, but I don't know the answer. Could you provide some context or relevant keywords for me? Or maybe just\nleave your email address and your name in the prompt, and one of my human colleagues will come back to you?`,
			model: dto?.model || 'gpt-3.5-turbo',
			max: dto.max,
			autocrawl: dto.autocrawl,
		});

		const styleCssValue = await this.styleCssRepository.findOne({
			where: { id: dto.styleCss },
		});
		const asset = await this.chatBotRepository.save({
			...chatBot,
			name: existDomain.result,
			style: styleCssValue.name,
		});

		const newChatBot = await this.chatBotRepository.findOne({
			where: { domain: chatBot.domain },
		});

		const instructionUrl = await this.chatbotService.generatePdfInstruction(
			newChatBot.id
		);
		await this.chatbotService.sendEmails(asset.user.id, instructionUrl);

		if (dto.recaptchaKey && dto.recaptchaSecret) {
			await this.chatbotService.updateAsset(asset.id, {
				recaptcha_key: dto.recaptchaKey,
				recaptcha_secret: dto.recaptchaSecret,
			});
		} else {
			await this.updateAsset(asset.id, { recaptcha: 0 });
		}
		return asset;
	}

	async update(id: number, dto: UpdateChatbotDTO) {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id },
			relations: { structure: true },
		});
		const assetBot = await this.mlTypeRepository.findOne({
			where: { type: chatBot.name },
		});

		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
		const structurValue = await this.structureRepository.findOne({
			where: { id: dto.structure.id },
			relations: { styleCss: true },
		});
		const styleCssValue = await this.styleCssRepository.findOne({
			where: { id: dto.styleCss.id },
		});

		chatBot.chatBotName = dto.chatBotName;
		chatBot.askMe = dto.askMe;
		chatBot.button = dto.button;
		chatBot.tone = dto.tone;
		chatBot.styleCss = styleCssValue;
		chatBot.expiryDate = dto.expiryDate;
		chatBot.style = styleCssValue.name;
		chatBot.structure = structurValue;
		chatBot.isActive = dto.isActive;
		chatBot.footer = dto.footer;
		await this.chatBotRepository.update(chatBot.id, chatBot);
		assetBot.is_active = dto.isActive;

		await this.mlTypeRepository.update(assetBot.type, assetBot);
		return chatBot;
	}

	async deleteAsset(id: number): Promise<void> {
		const asset = await this.chatBotRepository.findOne({
			where: {
				id: id,
			},
		});

		const deleteChatBot = await this.chatBotRepository.delete({
			id: id,
		});

		await this.aistaService.deleteAsset(asset.name);

		if (deleteChatBot.affected === 0) {
			throw new NotFoundException('User not found');
		}
	}

	async getAllChatBot(
		query: any
	): Promise<{ total: number; data: ChatBotEntity[] }> {
		try {
			const filter = query.filter || {};
			const whereCondition = {};
			for (const key in filter) {
				if (filter.hasOwnProperty(key)) {
					const filterValue = query.filter[key]?.split('||');
					const filterField = filterValue && filterValue[0];

					const filterQuery =
						filterValue && decodeURI(filterValue[2]).toLowerCase();

					if (filterField === 'user.email' && filterQuery) {
						whereCondition['user'] = { email: ILike(`%${filterQuery}%`) };
					} else if (filterField === 'creationDate' && filterQuery) {
						whereCondition['creationDate'] = Raw(
							(alias) =>
								`TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterQuery}%'`
						);
					} else {
						whereCondition[filterField] = ILike(`%${filterQuery}%`);
					}
				}
			}

			const [key, order] = query.sort && query.sort[0]?.split(',');

			const queryBuilder = await this.chatBotRepository.createQueryBuilder(
				'chatbot'
			);
			const [chatbots, total] = await queryBuilder
				.select([
					'chatbot.id',
					'chatbot.creationDate',
					'chatbot.user',
					'chatbot.tone',
					'chatbot.domain',
					'chatbot.button',
					'chatbot.askMe',
					'chatbot.isActive',
					'chatbot.name',
					'chatbot.style',
					'chatbot.imageUrl',
					'chatbot.expiryDate',
				])
				.leftJoinAndSelect('chatbot.user', 'user')
				.where(whereCondition)
				.orderBy(
					order
						? { [key.includes('user') ? key : 'chatbot.' + key]: order }
						: {}
				)

				.take(query.limit || 10)
				.skip(query.page ? (query.page - 1) * query.limit : 0)
				.getManyAndCount();

			return { total, data: chatbots };
		} catch (error) {
			this.logger.error('Error retrieving chatbots:', error);
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
	}

	async upload(
		assetId: number,
		file: any,
		updateData: Partial<ChatBotEntity>
	): Promise<ChatBotEntity> {
		const chatBot = await this.chatBotRepository.findOne({
			where: {
				id: assetId,
			},
		});
		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
		if (file) {
			const imageUrl = await this.uploadService.saveImage(file);
			chatBot.imageUrl = imageUrl;
		}

		if (updateData.chatBotName) {
			chatBot.chatBotName = updateData.chatBotName;
		}

		await this.chatBotRepository.update(chatBot.id, chatBot);
		return chatBot;
	}

	async findOneById(id: number): Promise<any> {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id: id },
			relations: {
				user: true,
				script: true,
				structure: true,
				styleCss: true,
			},
		});

		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}

		const mlSnippet = await this.mlTrainingSnippet.find({
			where: { type: chatBot.name },
		});
		chatBot.MlSnippet = mlSnippet;

		const mlRequest = await this.mlRequestRepository.find({
			where: { type: chatBot.name },
		});
		chatBot.MLRequest = mlRequest;

		return chatBot;
	}

	async updateAsset(
		assetId: number,
		dto: Partial<UpdateBotDTO>
	): Promise<void> {
		const asset = await this.chatBotRepository.findOneBy({
			id: assetId,
		});
		await this.aistaService.updateAsset({
			type: asset.name,
			...dto,
		});

		asset.isActive = dto.isActive;
		asset.askMe = dto.askMe;
		asset.tone = dto.tone;
		asset.chatBotName = dto.chatBotName;
		asset.button = dto.button;
		asset.style = dto.style;
		asset.footer = dto.footer;
		await this.chatBotRepository.update(asset.id, asset);
	}

	private generateScript(chatbotId: number) {
		return `
			&lt;script
				src="${process.env.HOST_BACKEND}chatbot/script?chatbotId=${chatbotId}"
				defer
			&gt;&lt;/script&gt;
		`;
	}

	async getHistory(query: any) {
		const filter = query?.filter || {};
		const whereCondition = {};

		for (const key in filter) {
			if (filter?.hasOwnProperty(key)) {
				const filterValue = query.filter[key]?.split('||');
				const filterField = filterValue && filterValue[0];

				const filterQuery =
					filterValue && decodeURI(filterValue[2]).toLowerCase();
				whereCondition[filterField] = ILike(`%${filterQuery}%`);
			}
		}

		const [key, order] = query.sort
			? query.sort[0]?.split(',')
			: ['id', 'DESC'];

		const history = await this.mlRequestRepository.find({
			where: whereCondition,
			order: { [key]: order },
			take: query.limit || 20,
			skip: query.page ? (query.page - 1) * query.limit : 0,
		});

		const total = await this.mlRequestRepository.count({
			where: whereCondition,
		});

		return { data: history, total };
	}

	async getHistoryById(id: number) {
		const history = await this.mlRequestRepository.findOne({
			where: { id: id },
		});

		return history;
	}

	async getUsageStatistics(
		userEmail: any
	): Promise<UsageStatisticsResponseDto> {
		const user = await this.userRepository.findOne({
			where: {
				email: userEmail,
			},
			relations: {
				chatBots: true,
			},
		});

		const response = new UsageStatisticsResponseDto();

		const subscription =
			await this.chatbotPlanService.getChatbotSubscriptionByEmail(user.email);
		const subscriptionInfo = subscription?.plan?.product?.metadata;

		if (subscriptionInfo == null) {
			response.contenterPoints = user.contenterPoints;
			response.maxBotsAllowedToCreate = 1;
			response.requestsCount = user.requestsCount;
			response.requestsPerMonth = 2000;
			response.snippetsAvailable = 300;
			response.snippetsCount = user.snippetsCount;
			response.snippetsDeletionDate = user.snippetsDeletionDate;
			response.subscriptionDueDate = user.subscriptionDueDate;
			response.subscriptionId = null;
			response.botsCount = user.chatBots.length;
		} else {
			response.contenterPoints = user.contenterPoints;
			response.maxBotsAllowedToCreate = Number(
				subscriptionInfo.maxBotsAllowedToCreate
			);
			response.requestsCount = user.requestsCount;
			response.requestsPerMonth = Number(subscriptionInfo.requestsPerMonth);
			response.snippetsAvailable = Number(subscriptionInfo.snippetsAvailable);
			response.snippetsCount = user.snippetsCount;
			response.snippetsDeletionDate = user.snippetsDeletionDate;
			response.subscriptionDueDate = user.subscriptionDueDate;
			response.subscriptionId = subscription.id;
			response.botsCount = user.chatBots.length;
		}

		return response;
	}
}
