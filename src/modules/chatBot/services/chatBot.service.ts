import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	Logger,
} from '@nestjs/common';
import { AistaService } from '@shared/services/aista.service';
import * as bcrypt from 'bcrypt';
import * as mustache from 'mustache';
import { SendEmailService } from '@modules/email/sendEmail.service';
import { UserService } from '@modules/user/user.service';
import { ChatbotPlanService } from '@modules/plan/services/chatbotPlan.service';
import { UploadService } from '@modules/shared/services/upload.service';
import { DocsService } from '@modules/shared/services/docs.service';
import {
	ChatBotEntity,
	ChatbotScriptRequestEntity,
	CssStyleEntity,
	InstructionUrlEntity,
	LeadsEntity,
	ScriptEntity,
	StructureEntity,
	UserEntity,
} from '@db/entities';

import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { MLType } from '@db/aistaEnities';
import { ChatBotDto } from '../dto/ChatbotDto';
import { ErrorMessages } from '@utils/errors/errors';
import { UpdateChatbotForFrontDTO } from '../dto/UpdateChatbotForFrontDto';
import { EmailTemplate } from '@modules/email/emailTemplate.enum';
import { ImportPageDto } from '../dto/ImportPageDto';
import { UsageStatisticsResponseDto } from '../dto/UsageStatisticsResponseDto';
import { UserDto } from '../../user/dto/UserDto';
import { CreateUserDto } from '../../user/dto/CreateUserDto';

@Injectable()
export class ChatBotService {
	private logger: Logger;

	constructor(
		private readonly aistaService: AistaService,
		private readonly emailService: SendEmailService,
		private readonly userService: UserService,
		private readonly chatbotPlanService: ChatbotPlanService,
		private readonly uploadService: UploadService,
		private readonly docsService: DocsService,

		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		@InjectRepository(CssStyleEntity)
		private readonly styleRepository: Repository<CssStyleEntity>,
		@InjectRepository(ScriptEntity)
		private readonly scriptRepository: Repository<ScriptEntity>,
		@InjectRepository(StructureEntity)
		private readonly structureRepository: Repository<StructureEntity>,
		@InjectRepository(InstructionUrlEntity)
		private readonly instructionUrlRepository: Repository<InstructionUrlEntity>,
		@InjectRepository(CssStyleEntity)
		private readonly styleCssRepository: Repository<CssStyleEntity>,
		@InjectRepository(LeadsEntity)
		private readonly leadsRepository: Repository<LeadsEntity>,
		@InjectRepository(MLType, 'aista')
		private readonly mlTypes: Repository<MLType>,
		@InjectRepository(ChatbotScriptRequestEntity)
		private readonly chatbotScriptRequestRepository: Repository<ChatbotScriptRequestEntity>
	) {
		this.logger = new Logger(ChatBotService.name);
	}

	removeProtocol(url: string) {
		url = url.replace(/(^\w+:|^)\/\//, '');
		return url.replace(/\/$/, '');
	}

	async createBotForLead(url: string, leadId: number) {
		try {
			let newUrl: string;
			if (url.startsWith('http://') || url.startsWith('https://')) {
				newUrl = new URL(url).hostname;
			}
			if (url.endsWith('/')) {
				url = url.slice(0, -1);
			}

			const bot = await this.aistaService.createAsset({
				url: newUrl,
				flavor: `We are going to play a role game. You are Jane, a sales executive for the company in the context, \n and every opportunity you have, you will recommend relevant products from your employer. You will answer all my questions\n with information found in the context specified in the next message, while preserving relevant markdown, such as hyperlinks\nand images, in addition to adding emojis where it makes sense. If you cannot find the answer to the question in the context,\n answer "I am sorry, but I don't know the answer. Could you provide some context or relevant keywords for me? Or maybe just\nleave your email address and your name in the prompt, and one of my human colleagues will come back to you?`,
				model: 'gpt-3.5-turbo',
				max: 50,
			});

			let id: number;
			let data: MLType;
			try {
				if (!bot?.result) {
					data = await this.mlTypes.findOneBy({
						type: newUrl.replace(/\./g, '_'),
					});
				}

				const defaultScript = await this.scriptRepository.find();
				const script = defaultScript[0];
				const defaultStructure = await this.structureRepository.find();
				const structure = defaultStructure[0];
				const structureCss = await this.structureRepository.findOne({
					where: { id: structure.id },
					relations: ['styleCss'],
				});
				const styleCss = structureCss.styleCss[0];
				const chatbot = await this.chatBotRepository.save({
					domain: url,
					name: bot?.result ?? data.type,
					lead: {
						id: leadId,
					},
					style: styleCss.name,
					script: script,
					structure: structure,
					styleCss: styleCss,
				});
				id = chatbot.id;
			} catch (e) {
				this.logger.error(e);
				const chatbot = await this.chatBotRepository.findOne({
					where: {
						name: bot?.result ?? data.type,
					},
				});
				await this.leadsRepository.update(leadId, {
					chatbot: {
						id: chatbot.id,
					},
				});
				id = chatbot.id;
			}
			return await this.generatePdfInstruction(id);
		} catch (e) {
			this.logger.error(e);
			return;
		}
	}
	async createAsset(userId: number, dto: ChatBotDto): Promise<ChatBotEntity> {
		const chatBot = {
			user: {
				id: userId,
			},
			...dto,
		} as unknown as ChatBotEntity;

		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: { chatBots: true },
		});

		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
		if (user.subscriptionId == null) {
			if (user.chatBots.length >= 1) {
				throw new ForbiddenException(ErrorMessages.chatbot.MAX_BOTS_REACHED);
			} else {
				const subscriptionExpiryDate = new Date();
				subscriptionExpiryDate.setDate(subscriptionExpiryDate.getDate() + 7);
				user.subscriptionDueDate = subscriptionExpiryDate;
				await this.userRepository.save(user);
			}
		} else {
			const subscriptionInfo =
				await this.chatbotPlanService.getChatbotSubscriptionInfo(
					user.subscriptionId
				);
			if (user.subscriptionDueDate < new Date()) {
				throw new ForbiddenException(ErrorMessages.user.SUBSCRIPTION_EXPIRED);
			} else if (
				user.chatBots.length >= subscriptionInfo.maxBotsAllowedToCreate
			) {
				throw new ForbiddenException(ErrorMessages.chatbot.MAX_BOTS_REACHED);
			}
		}

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
		});

		if (!dto.structure) {
			const staticStructure = await this.structureRepository.find();
			if (staticStructure.length > 0) {
				const firstStructureId = staticStructure[0].id;
				chatBot.structure = new StructureEntity();
				chatBot.structure.id = firstStructureId;
			}
		}

		if (!dto.styleCss) {
			const structureCss = await this.structureRepository.findOne({
				where: { id: chatBot.structure.id },
				relations: ['styleCss'],
			});
			if (structureCss.styleCss.length > 0) {
				const firstStyleCssId = structureCss.styleCss[0].id;
				chatBot.styleCss = new CssStyleEntity();
				chatBot.styleCss.id = firstStyleCssId;
			}
		}

		const styleCssValue = await this.styleCssRepository.findOne({
			where: { id: dto.styleCss },
		});

		const asset = await this.chatBotRepository.save({
			...chatBot,
			style: styleCssValue.name,
			name: existDomain.result,
		});

		const newChatBot = await this.chatBotRepository.findOne({
			where: { domain: chatBot.domain },
		});

		const instructionUrl = await this.generatePdfInstruction(newChatBot.id);
		newChatBot.id;

		await this.sendEmails(user.id, instructionUrl);

		if (dto.recaptchaKey && dto.recaptchaSecret) {
			await this.updateAsset(asset.id, {
				recaptcha_key: dto.recaptchaKey,
				recaptcha_secret: dto.recaptchaSecret,
			});
		} else {
			await this.updateAsset(asset.id, { recaptcha: 0 });
		}
		return asset;
	}

	async getChatBotScriptById(chatBotId: number) {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id: chatBotId },
			relations: ['script', 'structure', 'styleCss', 'user'],
		});
		const chatbotRequest = await this.chatbotScriptRequestRepository.find({
			where: { chatBotId: chatBotId },
		});

		const lead = await this.leadsRepository.findOne({
			where: {
				email: chatBot.user.email,
			},
		});
		const user = await this.userRepository.findOne({
			where: { email: chatBot.user.email },
		});

		let salt: string;
		if (lead && chatbotRequest.length === 0) {
			const password = this.generateRandomPassword(8);
			const link = process.env.LINK_TO_CABINET;
			const emailLanguage = lead.language || 'en';
			const emailTemplate =
				emailLanguage === 'ua'
					? EmailTemplate.Hello_UA
					: EmailTemplate.Hello_EN;
			await this.emailService.sendEmailByTemplateForLead(emailTemplate, {
				email: user.email,
				link,
				username: lead.firstName,
				surname: lead.lastName,
				password: password,
			});
			salt = await bcrypt.genSalt(10);
			user.salt = salt;
			user.password = await bcrypt.hash(password + salt, 10);
			await this.userRepository.save(user);
		}

		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}
		const jsTemplate = chatBot.script.code;
		const mlType = await this.mlTypes.findOne({
			where: { type: chatBot.name },
		});

		const style = chatBot.styleCss.cssName;
		const askMe = chatBot.askMe;
		const recaptcha = mlType.recaptcha_key;
		const domain = chatBot.domain;
		const name = chatBot.name;
		const rtl = chatBot.rtl;
		const header = chatBot.header;
		const chat = chatBot.chat;
		const search = chatBot.search;
		const markdown = chatBot.markdown;
		const speech = chatBot.speech;
		const button = chatBot.button;
		const footer = chatBot.footer;
		const imageUrl = chatBot.imageUrl;
		const urlForBot = process.env.URL_FOR_BOT;
		const hostBack = process.env.HOST_BACKEND;
		const picPath = process.env.STATIC_PIC_PATH;
		const url = `${hostBack}chatbot/style?cssName=${chatBot.styleCss.cssName}`;
		const data = {
			style,
			askMe,
			recaptcha,
			domain,
			name,
			rtl,
			header,
			chat,
			search,
			markdown,
			speech,
			button,
			footer,
			imageUrl,
			urlForBot,
			hostBack,
			picPath,
			url,
		};
		const script = mustache.render(jsTemplate, data);
		this.chatbotScriptRequestRepository.save({
			chatBotId: chatBot.id,
		});

		return script;
	}

	async getOneStyleByCssName(cssName: string) {
		const style = await this.styleRepository.findOne({
			where: { cssName },
		});
		if (!style) {
			throw new NotFoundException(`Style with id ${cssName} not found`);
		}
		return style.properties;
	}

	async getOneScriptById(id: number) {
		const script = await this.scriptRepository.findOne({ where: { id } });
		if (!script) {
			throw new NotFoundException(`Script with id ${id} not found`);
		}
		return script.code;
	}

	async getAllStruct() {
		return await this.structureRepository.find();
	}

	async getStructById(id: number) {
		const structure = await this.structureRepository.findOne({
			where: { id },
			relations: { styleCss: true },
		});
		if (!structure) {
			throw new NotFoundException(`Structur with id ${id} not found`);
		}
		return structure;
	}

	async sendEmails(userId: number, instruction: string) {
		try {
			const { email } = await this.userService.findOneById(userId);
			await this.emailService.sendEmailByTemplate(EmailTemplate.NewChatBot, {
				email,
				linkToInstruction: instruction,
			});
		} catch (error) {
			console.log(error);
		}
	}

	async uploadImage(assetId: number, file: any): Promise<ChatBotEntity> {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id: assetId },
		});

		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}

		if (typeof file === 'string') {
			chatBot.imageUrl = await this.uploadService.saveImageFromBase64(file);
		} else {
			chatBot.imageUrl = await this.uploadService.saveImage(file);
		}

		await this.chatBotRepository.update(chatBot.id, chatBot);
		return chatBot;
	}

	async update(id: number, updateData: UpdateChatbotForFrontDTO) {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id },
			relations: { structure: true, styleCss: true },
		});
		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
		const structurValue = await this.structureRepository.findOne({
			where: { id: updateData.structure },
			relations: { styleCss: true },
		});
		const styleCssValue = await this.styleCssRepository.findOne({
			where: { id: updateData.styleCss },
		});
		chatBot.chatBotName = updateData.chatBotName;
		chatBot.askMe = updateData.askMe;
		chatBot.button = updateData.button;
		chatBot.tone = updateData.tone;
		chatBot.speech = updateData.speech;
		chatBot.search = updateData.search;
		chatBot.style = styleCssValue.name;
		chatBot.styleCss.id = styleCssValue.id;
		chatBot.structure.id = structurValue.id;
		chatBot.footer = updateData.footer;
		await this.chatBotRepository.update(chatBot.id, chatBot);

		return chatBot;
	}

	async importPage(user: any, dto: ImportPageDto) {
		const chatBot = await this.chatBotRepository.findOne({
			where: {
				id: dto.id,
			},
			relations: ['user'],
		});
		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
		if (user.id !== chatBot.user.id) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		return await this.aistaService.importNewPage({
			threshold: dto.threshold,
			delay: dto.delay,
			max: dto.max,
			summarize: dto.summarize,
			type: chatBot.name,
			url: dto.url,
		});
	}

	async getAllAsset(userId: number): Promise<ChatBotEntity[]> {
		const parsedUserId = Number(userId);
		if (isNaN(parsedUserId)) {
			throw new BadRequestException(ErrorMessages.user.INVALID_USER_ID);
		}

		return await this.chatBotRepository.find({
			where: { user: { id: parsedUserId } },
			relations: {
				user: true,
			},
		});
	}

	async deleteAsset(userId: number, assetId: number): Promise<void> {
		const asset = await this.chatBotRepository.findOne({
			where: {
				id: assetId,
			},
		});
		if (!asset) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}

		await this.chatBotRepository.delete({
			id: assetId,
		});

		await this.aistaService.deleteAsset(asset.name);
	}

	async updateAsset(assetId: number, dto: Partial<MLType>): Promise<void> {
		try {
			const asset = await this.chatBotRepository.findOneBy({
				id: assetId,
			});
			await this.mlTypes.update(asset.name, dto);
		} catch (e) {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ASSET_UPDATE_ERROR
			);
		}
	}

	async blockedAsset(assetId: number): Promise<void> {
		try {
			await this.chatBotRepository.findOneBy({
				id: assetId,
			});
		} catch (e) {
			throw new InternalServerErrorException(
				ErrorMessages.chatbot.ASSET_UPDATE_ERROR
			);
		}
	}

	private generateScript(chatbotId: number) {
		return `
			&lt;script
				src="${process.env.HOST_BACKEND}chatbot/script?chatbotId=${chatbotId}"
				defer
			&gt;&lt;/script&gt;
		`;
	}

	async generatePdfInstruction(chatbotId: number): Promise<string> {
		const chatBot = await this.chatBotRepository.findOne({
			where: { id: chatbotId },
		});
		if (!chatBot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}
		const displayedScript = this.generateScript(chatBot.id);
		const emailTemplate = await this.emailService.getTemplate(
			EmailTemplate.Instruction
		);
		const test = await this.docsService.generatePDFFromHTML(
			emailTemplate.template.replace(/__script__/g, displayedScript)
		);
		return test;
	}

	async getUsageStatistics(user: any): Promise<UsageStatisticsResponseDto> {
		const userWithChatbots = await this.userRepository.findOne({
			where: {
				id: user.id,
			},
			relations: {
				chatBots: true,
			},
		});

		const response = new UsageStatisticsResponseDto();

		const subscriptionInfo =
			await this.chatbotPlanService.getChatbotSubscriptionInfo(
				userWithChatbots.subscriptionId
			);

		if (subscriptionInfo == null) {
			response.contenterPoints = userWithChatbots.contenterPoints;
			response.maxBotsAllowedToCreate = 1;
			response.requestsCount = userWithChatbots.requestsCount;
			response.requestsPerMonth = 2000;
			response.snippetsAvailable = 300;
			response.snippetsCount = userWithChatbots.snippetsCount;
			response.snippetsDeletionDate = userWithChatbots.snippetsDeletionDate;
			response.subscriptionDueDate = userWithChatbots.subscriptionDueDate;
			response.subscriptionId = userWithChatbots.subscriptionId;
			response.botsCount = userWithChatbots.chatBots.length;
		} else {
			response.contenterPoints = userWithChatbots.contenterPoints;
			response.maxBotsAllowedToCreate = Number(
				subscriptionInfo.maxBotsAllowedToCreate
			);
			response.requestsCount = userWithChatbots.requestsCount;
			response.requestsPerMonth = Number(subscriptionInfo.requestsPerMonth);
			response.snippetsAvailable = Number(subscriptionInfo.snippetsAvailable);
			response.snippetsCount = userWithChatbots.snippetsCount;
			response.snippetsDeletionDate = userWithChatbots.snippetsDeletionDate;
			response.subscriptionDueDate = userWithChatbots.subscriptionDueDate;
			response.subscriptionId = userWithChatbots.subscriptionId;
			response.botsCount = userWithChatbots.chatBots.length;
		}

		return response;
	}

	async generateBotForOneLead(): Promise<void> {
		const lead = await this.findUnprocessedLead();
		if (!lead) return;

		const existingChatbot = await this.findChatBotByDomainWithUser(
			lead.companyURL
		);

		if (existingChatbot) {
			await this.markLeadAsProcessed(lead);
			const existingUser = await this.userRepository.findOne({
				where: { email: lead.email },
			});

			if (!existingUser) {
				await this.registerUserFromLead(lead);

				const instructionUrl = await this.createInstructionUrlForLead(lead);

				await this.updateLeadWithInstructionUrl(lead, instructionUrl);
			}

			return;
		}
		await this.registerChatBotsWithUsers();

		await this.markLeadAsProcessed(lead);

		const registeredUsers: UserDto[] = [];
		try {
			if (await this.shouldSkipLeadProcessing(lead)) {
				return;
			}

			if (existingChatbot) {
				const existingUser = await this.userRepository.findOne({
					where: { email: lead.email },
				});

				if (!existingUser) {
					await this.registerUserFromLead(lead);

					const instructionUrl = await this.createInstructionUrlFor(lead);

					await this.updateLeadWithInstructionUrl(lead, instructionUrl);
				}

				return;
			}

			if (
				(!lead.email && lead.companyURL) ||
				(lead.email && !lead.companyURL)
			) {
				const instructionUrl = await this.createInstructionUrl(lead);
				if (!instructionUrl) {
					return;
				}
				await this.updateLeadWithInstructionUrl(lead, instructionUrl);
				const leadWithemail = await this.findLeadEmailByFullName(
					lead.firstName,
					lead.lastName
				);

				if (leadWithemail) {
					const userLeads = await this.leadsRepository.findOne({
						where: { id: leadWithemail },
					});
					const testUser = await this.userRepository.findOne({
						where: { email: userLeads.email },
					});
					const chatbot = await this.findChatBotByDomain(lead.companyURL);

					await this.updateChatBotWithLead(chatbot, testUser);
				}
			} else {
				const instructionUrl = await this.createInstructionUrl(lead);
				if (!instructionUrl) {
					return;
				}
				await this.updateLeadWithInstructionUrl(lead, instructionUrl);

				const newLead = await this.getLeadById(lead.id);

				const leadDto: CreateUserDto = this.createLeadDto(newLead);

				const newUser = await this.userService.createUser(leadDto);
				const chatbot = await this.findChatBotByDomain(lead.companyURL);

				await this.updateChatBotWithUser(chatbot, newUser);

				registeredUsers.push(newUser);
			}
		} catch (e) {
			this.handleProcessingError(lead, e);
			return;
		}
	}
	private async findLeadEmailByFullName(firstName: string, lastName: string) {
		const leads = await this.leadsRepository.find({
			where: {
				firstName: firstName,
				lastName: lastName,
			},
		});

		for (const lead of leads) {
			if (lead.email) {
				return lead.id;
			}
		}

		return null;
	}

	private async findUnprocessedLead() {
		return await this.leadsRepository
			.createQueryBuilder('leads')
			.where(
				`leads.chatbotId IS NULL AND leads.companyURL != '' AND leads.processed = false`
			)
			.getOne();
	}

	private async markLeadAsProcessed(lead: LeadsEntity) {
		lead.processed = true;
		await this.leadsRepository.save(lead);
	}

	private async shouldSkipLeadProcessing(lead: LeadsEntity) {
		const existUser = await this.userRepository.findOne({
			where: { email: lead.email },
		});

		if (existUser) {
			const connection = await this.userRepository.findOne({
				where: { lead: lead, email: lead.email, chatBots: null },
			});

			return !!connection;
		}

		return false;
	}

	private async createInstructionUrl(lead: LeadsEntity) {
		let normalizedURL = lead.companyURL;

		if (
			lead.companyURL?.includes('http://') ||
			lead.companyURL?.includes('https://')
		) {
			normalizedURL = lead.companyURL.replace('http://', 'https://');
		} else {
			normalizedURL = 'https://' + lead.companyURL;
		}

		const instructionUrl = await this.createBotForLead(normalizedURL, lead.id);
		if (!instructionUrl) {
			return;
		}
		return instructionUrl;
	}

	private async updateLeadWithInstructionUrl(
		lead: LeadsEntity,
		instructionUrl: string
	) {
		try {
			if (!lead.instructionUrls) {
				lead.instructionUrls = [];
			}

			const newInstructionUrl = new InstructionUrlEntity();
			newInstructionUrl.instructionUrl = instructionUrl;

			lead.instructionUrls.push(newInstructionUrl);

			await this.leadsRepository.save(lead);
		} catch (error) {
			console.error('Error updating lead with instructionUrl:', error);
		}
	}

	private async getLeadById(leadId: number) {
		return await this.leadsRepository.findOne({
			where: { id: leadId },
		});
	}

	private createLeadDto(newLead: LeadsEntity) {
		return {
			lastLoginDate: new Date(),
			lead: newLead,
			username: newLead.firstName,
			surname: newLead.lastName,
			email: newLead.email,
			password: this.generateRandomPassword(8),
			salt: '',
			emailConfirmCode: '',
			isEmailConfirmed: true,
			chatBots: [newLead.chatbot],
		};
	}

	private async findChatBotByDomain(domain: string) {
		const chatbot = await this.chatBotRepository.findOne({
			where: { domain: this.normalizeDomain(domain), user: IsNull() },
		});
		if (!chatbot) {
			return;
		}
		return chatbot;
	}
	private async findChatBotByDomainWithUser(domain: string) {
		const chatbot = await this.chatBotRepository.findOne({
			where: { domain: this.normalizeDomain(domain) },
		});
		if (!chatbot) {
			return;
		}
		return chatbot;
	}

	private async updateChatBotWithUser(
		chatbot: ChatBotEntity,
		newUser: UserDto
	) {
		await this.chatBotRepository.update(chatbot.id, {
			user: { id: newUser.id },
		});
	}
	private async updateChatBotWithLead(
		chatbot: ChatBotEntity,
		newUser: UserDto
	) {
		await this.chatBotRepository.update(chatbot.id, {
			user: { id: newUser.id },
		});
	}

	private handleProcessingError(lead: LeadsEntity, error: any) {
		this.logger.error(error);

		const instructionUrlEntity = lead.instructionUrls.find(
			(urlEntity) => urlEntity.instructionUrl === 'error'
		);

		if (instructionUrlEntity) {
			instructionUrlEntity.instructionUrl = 'error';

			this.instructionUrlRepository.save(instructionUrlEntity);
		}
	}

	normalizeDomain(url: string): string {
		if (url.endsWith('/')) {
			url = url.slice(0, -1);
		}
		if (url.startsWith('http://')) {
			return 'https://' + new URL(url).hostname;
		} else if (url.startsWith('https://')) {
			return url;
		}
		return 'https://' + url;
	}

	generateRandomPassword(length: number): string {
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&';

		let password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset.charAt(randomIndex);
		}

		return password;
	}
	async updateUserChatbotsFromLead(
		lead: Partial<LeadsEntity>,
		userId: number
	): Promise<void> {
		const chatbot = await this.chatBotRepository.findOne({
			where: {
				leads: {
					id: lead.id,
				},
			},
		});
		if (chatbot) {
			await this.chatBotRepository.update(chatbot.id, {
				user: {
					id: userId,
				},
			});
		}
	}
	async getChatBotsWithoutUserAndRemove(): Promise<ChatBotEntity[]> {
		const chatbotsWithoutUser = await this.chatBotRepository.find({
			where: { user: null },
		});
		if (chatbotsWithoutUser.length === 0) {
			return;
		}
		await Promise.all(
			chatbotsWithoutUser.map(async (chatbot) => {
				await this.deleteChatBot(chatbot.id);
			})
		);
	}
	private async deleteChatBot(chatbotId: number): Promise<void> {
		const chatbot = await this.chatBotRepository.findOne({
			where: { id: chatbotId },
		});

		if (!chatbot) {
			throw new NotFoundException(ErrorMessages.chatbot.ASSET_NOT_FOUND);
		}

		await this.chatBotRepository.delete(chatbotId);

		await this.aistaService.deleteAsset(chatbot.name);
	}

	async registerChatBotsWithUsers(): Promise<void> {
		const unprocessedLeads = await this.findUnprocessedLeadsWithNullChatBotId();

		await Promise.all(
			unprocessedLeads.map(async (lead) => {
				const chatBot = await this.findChatBotByDomain(lead.companyURL);

				if (chatBot) {
					const newUser = await this.registerUserFromLead(lead);
					await this.updateChatBotWithUser(chatBot, newUser);
					await this.markLeadAsProcessed(lead);
				}
			})
		);
	}

	private async findUnprocessedLeadsWithNullChatBotId(): Promise<
		LeadsEntity[]
	> {
		return await this.leadsRepository
			.createQueryBuilder('leads')
			.leftJoinAndSelect('leads.chatbot', 'chatbot')
			.where(
				`leads.chatbotId IS NULL AND leads.companyURL != '' AND leads.email IS NOT NULL AND leads.processed = false`
			)
			.getMany();
	}

	private async registerUserFromLead(lead: LeadsEntity): Promise<UserDto> {
		const newLead = await this.getLeadById(lead.id);

		const leadDto: CreateUserDto = this.createLeadDto(newLead);

		return await this.userService.createUser(leadDto);
	}

	private async createInstructionUrlFor(lead: LeadsEntity): Promise<string> {
		let normalizedURL = lead.companyURL;

		if (
			lead.companyURL?.includes('http://') ||
			lead.companyURL?.includes('https://')
		) {
			normalizedURL = lead.companyURL.replace('http://', 'https://');
		} else {
			normalizedURL = 'https://' + lead.companyURL;
		}

		const chatbot = await this.findChatBotByDomain(normalizedURL);

		if (!chatbot) {
			throw new NotFoundException(
				'ChatBot not found for domain: ' + normalizedURL
			);
		}

		return await this.generatePdfInstruction(chatbot.id);
	}
	private async createInstructionUrlForLead(
		lead: LeadsEntity
	): Promise<string> {
		let normalizedURL = lead.companyURL;

		if (
			lead.companyURL?.includes('http://') ||
			lead.companyURL?.includes('https://')
		) {
			normalizedURL = lead.companyURL.replace('http://', 'https://');
		} else {
			normalizedURL = 'https://' + lead.companyURL;
		}

		const chatbot = await this.findChatBotByDomainWithUser(normalizedURL);

		if (!chatbot) {
			throw new NotFoundException(
				'ChatBot not found for domain: ' + normalizedURL
			);
		}

		return await this.generatePdfInstruction(chatbot.id);
	}
}
