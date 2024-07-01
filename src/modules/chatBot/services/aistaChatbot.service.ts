import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Brackets, ILike, In, Repository } from 'typeorm';

import { AistaService } from '@modules/shared/services/aista.service';
import { DocsService } from '@shared/services/docs.service';
import { UpdateMlTypeDto } from '../dto/UpdateMlTypeDto';
import { ChatBotEntity } from '@db/entities';
import { MLRequest, MLTrainingSnippet, MLType } from '@db/aistaEnities';
import { ChatBotDto } from '../dto/ChatbotDto';
import { AskChatOpenAiDto } from '../dto/AskChatOpenAiDto';
import { ErrorMessages } from '@utils/errors/errors';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AistaChatbotService {
	private readonly aistaToken: string;
	private aistaUrl: string;
	private models: string;

	constructor(
		private readonly aistaService: AistaService,
		private readonly docsService: DocsService,
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		@InjectRepository(MLType, 'aista')
		private readonly mlTypeRepository: Repository<MLType>,
		@InjectRepository(MLRequest, 'aista')
		private readonly mlRequestRepository: Repository<MLRequest>,
		@InjectRepository(MLTrainingSnippet, 'aista')
		private readonly mlTrainingSnippetRepository: Repository<MLTrainingSnippet>,
		private readonly configService: ConfigService
	) {
		this.aistaToken = this.configService.get('aista.aista_token');
		this.aistaUrl = this.configService.get('aista.aista_host');
		this.models = 'openai/models';
	}

	async getChatbotById(id: number): Promise<ChatBotEntity> {
		return await this.chatBotRepository.findOneBy({ id });
	}

	async saveAistaAsset(assetDto: ChatBotDto) {
		await this.mlTypeRepository.save({
			base_url: assetDto.domain,
			model: assetDto?.model || 'gpt-3.5-turbo',
			max_tokens: 10,
			temperature: 10,
			type: 'test_com',
		});
	}

	async blockedAsset(type: string): Promise<MLType> {
		const asset = await this.mlTypeRepository.findOneBy({ type: type });
		if (asset) {
			asset.is_active = false;
			return this.mlTypeRepository.save(asset);
		} else {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
	}

	async unblockedAsset(type: string): Promise<MLType> {
		const asset = await this.mlTypeRepository.findOneBy({ type: type });
		if (asset) {
			asset.is_active = true;
			return this.mlTypeRepository.save(asset);
		} else {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
	}

	async removedAsset(type: string): Promise<MLType> {
		const asset = await this.mlTypeRepository.findOneBy({ type: type });
		if (asset) {
			return this.mlTypeRepository.remove(asset);
		} else {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
	}

	async getMlTypeByChatbotId(id: number): Promise<MLType> {
		const chatbot = await this.chatBotRepository.findOneBy({ id });
		if (!chatbot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
		const name = chatbot.name;
		const asset = await this.mlTypeRepository.findOneBy({ type: name });

		if (!asset) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}

		return asset;
	}

	async editTrainingSnippet(id: number, data: Partial<MLTrainingSnippet>) {
		const { affected } = await this.mlTrainingSnippetRepository.update(
			id,
			data
		);
		if (!affected) {
			throw new NotFoundException(ErrorMessages.chatbot.SNIPPET_NOT_FOUND);
		}
		return { affected };
	}

	async addTrainingSnippet(
		id: number,
		data: Partial<MLTrainingSnippet>
	): Promise<MLTrainingSnippet> {
		const mlType = await this.getMlTypeByChatbotId(id);
		return await this.mlTrainingSnippetRepository.save({
			...data,
			mlType: mlType,
		});
	}

	async deleteTrainingSnippet(id: number): Promise<void> {
		const { affected } = await this.mlTrainingSnippetRepository.delete(id);
		if (!affected) {
			throw new NotFoundException(ErrorMessages.chatbot.SNIPPET_NOT_FOUND);
		}
	}

	async deleteTrainingSnippetsByIds(ids: number[]): Promise<void> {
		const { affected } = await this.mlTrainingSnippetRepository.delete({
			id: In(ids),
		});
		if (!affected) {
			throw new NotFoundException(ErrorMessages.chatbot.SNIPPET_NOT_FOUND);
		}
	}

	async startVectorise(chatBotId: number): Promise<void> {
		const mlType = await this.getMlTypeByChatbotId(chatBotId);
		await this.aistaService.request(
			'openai/vectorise',
			{
				type: mlType.type,
			},
			'POST'
		);
	}

	async askChatOpenAi(dto: AskChatOpenAiDto, assetId: number): Promise<any> {
		const chatBot = await this.chatBotRepository.findOne({
			where: {
				id: assetId,
			},
		});
		const chatOpenAI = await this.aistaService.askAistaOpenAI({
			prompt: dto.prompt,
			type: chatBot.name,
			references: dto.references,
		});

		return chatOpenAI;
	}

	async findOneById(id: number): Promise<ChatBotEntity> {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id: id },
			relations: {
				user: true,
				script: true,
				structure: true,
			},
		});

		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}
		const mlType = await this.mlTrainingSnippetRepository.find({
			where: { type: chatBot.name },
		});
		chatBot.mlType = mlType;
		return chatBot;
	}

	async getHistoryByChatbotId(query: any, user: any) {
		const chatbot = await this.chatBotRepository.findOne({
			where: {
				id: query.chatBotIDs,
				user: { id: user.id },
			},
		});
		const qb = this.mlRequestRepository.createQueryBuilder('mlRequest');

		qb.where(`mlRequest.type = :chatbotName`, {
			chatbotName: chatbot.name,
		});

		if (query?.search) {
			qb.andWhere(
				new Brackets((qb1) => {
					qb1
						.orWhere('mlRequest.prompt ILike :search', {
							search: `%${query.search}%`,
						})
						.orWhere('mlRequest.completion ILike :search', {
							search: `%${query.search}%`,
						});
				})
			);
		}

		if (query?.from && query?.to) {
			const from = new Date(query.from);
			const to = new Date(query.to);
			qb.andWhere(`mlRequest.created BETWEEN :from AND :to`, {
				from,
				to,
			});
		}

		if (query?.order) {
			const [orderBy, orderDirection] = query.order.split(',');
			qb.orderBy({ [orderBy]: orderDirection });
		}

		if (query?.page && query?.perPage) {
			const page = parseInt(query.page);
			const perPage = parseInt(query.perPage);
			qb.skip((page - 1) * perPage).take(perPage);
		} else {
			qb.take(10);
		}

		const [data, total] = await qb.getManyAndCount();

		return {
			data,
			totalResults: total,
			totalPages: Math.ceil(total / (query?.perPage || 10)),
		};
	}

	async getFooter(chatbotName: string) {
		const chatbot = await this.chatBotRepository.findOne({
			where: { name: chatbotName },
		});

		if (!chatbot) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}

		return { footer: chatbot.footer };
	}

	async deleteAllSnippetsByChatBotId(chatbotId: number) {
		const chatbot = await this.chatBotRepository.findOne({
			where: { id: chatbotId },
		});

		if (!chatbot) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}

		const deleteResponse = await this.mlTrainingSnippetRepository.delete({
			type: chatbot.name,
		});

		deleteResponse.affected;

		return {
			message: `All snippets deleted. ${deleteResponse.affected} affected`,
			affected: deleteResponse.affected,
		};
	}

	async snippetsSearch(query: any, user: any) {
		let types;

		if (query?.chatBotIDs) {
			const chatbots = await this.chatBotRepository.find({
				where: {
					id: In(query?.chatBotIDs?.split(',')),
					user: { id: user.id },
				},
			});
			if (chatbots.length === 0) {
				throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
			}
			types = chatbots.map((chatbot) => chatbot.name);
		} else {
			const userChatbots = await this.chatBotRepository.find({
				where: {
					user: { id: user.id },
				},
			});
			types = userChatbots.map((chatbot) => chatbot.name);
		}

		const order = query?.order ? query?.order?.split(',') : null;

		const [data, total] = await this.mlTrainingSnippetRepository.findAndCount({
			where: [
				{
					prompt: query?.search ? ILike(`%${query?.search}%`) : null,
					type: In(types),
				},
				{
					completion: query?.search ? ILike(`%${query?.search}%`) : null,
					type: In(types),
				},
				{
					uri: query?.search ? ILike(`%${query?.search}%`) : null,
					type: In(types),
				},
			],
			order: order ? { [order[0]]: order[1] } : null,
			skip: query?.page ? (query?.page - 1) * query?.perPage : 0,
			take: query?.perPage || 10,
		});

		return {
			data,
			totalResults: total,
			totalPages: Math.ceil(total / (query?.perPage || 10)),
		};
	}

	async exportSnippets(type: 'csv' | 'xlsx', id: number): Promise<string> {
		const chatbot = await this.chatBotRepository.findOneBy({ id });
		if (!chatbot) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}
		const snippets = await this.mlTrainingSnippetRepository.find({
			where: { mlType: { type: chatbot.name } },
			select: ['prompt', 'completion', 'uri'],
		});
		if (snippets.length === 0) {
			throw new NotFoundException(
				ErrorMessages.chatbot.CHATBOT_SNIPPET_NOT_FOUND
			);
		}
		return type === 'csv'
			? await this.docsService.buildCSV(snippets)
			: await this.docsService.buildXLSX(snippets);
	}

	async exportSnippetsByIds(
		type: 'csv' | 'xlsx',
		ids: number[]
	): Promise<string> {
		const snippets = await this.mlTrainingSnippetRepository.find({
			where: { id: In(ids) },
			select: ['prompt', 'completion', 'uri'],
		});
		if (snippets.length === 0) {
			throw new NotFoundException(
				ErrorMessages.chatbot.CHATBOT_SNIPPET_NOT_FOUND
			);
		}
		return type === 'csv'
			? await this.docsService.buildCSV(snippets)
			: await this.docsService.buildXLSX(snippets);
	}

	async getCountNotVectSnippets(chatbotId: number) {
		const { name } = await this.chatBotRepository.findOneBy({ id: chatbotId });
		return await this.mlTrainingSnippetRepository.query(
			"SELECT COUNT(*) FROM ml_training_snippets WHERE type = '" +
				name +
				"' AND embedding IS NULL"
		);
	}

	async importSnippets(file: Express.Multer.File, id: number): Promise<void> {
		try {
			const chatbot = await this.chatBotRepository.findOneBy({ id });
			let data;
			if (file?.originalname.includes('.csv')) {
				const records = await this.docsService.parseCSV(file);
				data = await this.docsService.saveFromCSVorXLSX(records);
			} else {
				const records = await this.docsService.parseXLSX(file);
				data = await this.docsService.saveFromXLSX(records[0].data);
			}
			data = data.map((snippet) => ({
				...snippet,
				mlType: {
					type: chatbot.name,
				},
			}));
			await this.mlTrainingSnippetRepository.save(data);
		} catch (e) {
			throw new ConflictException(ErrorMessages.chatbot.DUBLICATE_SNIPPET);
		}
	}

	async configurationMlType(id: number, dto: UpdateMlTypeDto) {
		try {
			const chatBot = await this.chatBotRepository.findOne({ where: { id } });
			chatBot.tone = dto.flavor;
			await this.chatBotRepository.update(chatBot.id, chatBot);
			const ml_type = await this.mlTypeRepository.findOne({
				where: { type: chatBot.name },
			});
			if (!ml_type) {
				throw new NotFoundException(ErrorMessages.chatbot.MLTYPE_NOT_FOUND);
			}
			Object.assign(ml_type, dto);
			await this.mlTypeRepository.save(ml_type);

			return { affected: 1 };
		} catch {
			return new InternalServerErrorException(
				ErrorMessages.chatbot.MLTYPE_CONFIGURE_FAILED
			);
		}
	}

	async getMlTypeById(id: number) {
		const chatBot = await this.chatBotRepository.findOne({ where: { id } });
		const ml_type = await this.mlTypeRepository.findOne({
			where: { type: chatBot.name },
		});
		if (!ml_type) {
			throw new NotFoundException(ErrorMessages.chatbot.MLTYPE_NOT_FOUND);
		}

		return ml_type;
	}

	async getModels() {
		const models = await this.aistaService.request(
			'openai/models',
			null,
			'GET'
		);
		return models;
	}
}
