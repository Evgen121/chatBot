import {
	Controller,
	Body,
	Post,
	Req,
	UseGuards,
	Delete,
	Query,
	Get,
	Param,
	UnauthorizedException,
	UploadedFile,
	UseInterceptors,
	Patch,
	NotFoundException,
	Res,
} from '@nestjs/common';
import { ChatBotService } from './services/chatBot.service';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import {
	ApiBody,
	ApiHeader,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { UpdateChatbotForFrontDTO } from './dto/UpdateChatbotForFrontDto';

import { FileInterceptor } from '@nestjs/platform-express';
import { AistaChatbotService } from './services/aistaChatbot.service';
import { UsageStatisticsResponseDto } from './dto/UsageStatisticsResponseDto';
import { StyleDto } from './dto/StyleDto';
import { ScriptDto } from './dto/ScriptDto';
import { UpdateMlTypeDto } from './dto/UpdateMlTypeDto';
import { CreateAssetResponseDto } from './dto/CreateAssetResponseDto';
import { ChatBotDto } from './dto/ChatbotDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { ChatBotEntity, StructureEntity } from '@db/entities';
import { UpdateAssetResponseDto } from './dto/UpdateAssetResponseDto';
import { ImportPageDto } from './dto/ImportPageDto';
import { UploadImageDto } from './dto/UploadImageDto';
import { UpdateTrainingSnippetDto } from './dto/UpdateTrainingSnippetDto';
import { AnswerChatOpenAiDto } from './dto/AnswerChatOpenAiDto';
import { AskChatOpenAiDto } from './dto/AskChatOpenAiDto';
import { MLTrainingSnippet, MLType } from '@db/aistaEnities';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { DeepPartial } from 'typeorm';
import { ErrorMessages } from '@utils/errors/errors';
import { DomainGuard } from '@utils/guards/domain.guard';

@ApiTags('ChatBot')
@Controller('chatbot')
export class ChatBotController {
	constructor(
		private readonly chatBotService: ChatBotService,
		private readonly aistaChatbotService: AistaChatbotService
	) {}

	@ApiResponse({ status: 201, type: CreateAssetResponseDto })
	@ApiBody({
		type: ChatBotDto,
		description: SwaggerComments.CREATE_CHATBOT,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Post('create')
	async createAsset(
		@Body() assetDto: any,
		@Req() req: any
	): Promise<DeepPartial<ChatBotEntity>> {
		const user = req.user;
		return this.chatBotService.createAsset(user.id, assetDto);
	}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.GET_SCRIPT_FOR_CHATBOT,
	})
	@ApiQuery({
		required: false,
		name: 'chatbotId',
		description: 'search chatBot by chatbotId',
		example: '1,2,3',
	})
	@UseGuards(DomainGuard)
	@Get('/script')
	async getChatBotScriptById(@Query('chatbotId') id: number) {
		const chatBotScript = await this.chatBotService.getChatBotScriptById(id);
		return chatBotScript;
	}

	@ApiParam({
		name: 'cssName',
		type: String,
		required: true,
		example: 'modernDark',
	})
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_STYLE_BY_NAME,
		type: StyleDto,
	})
	@Get('style')
	async getOneStyleByCssName(@Query('cssName') cssName: string) {
		return await this.chatBotService.getOneStyleByCssName(cssName);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_SCRIPT_BY_ID,
		type: ScriptDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('script/:id')
	async getOneScriptById(@Param('id') id: number) {
		return await this.chatBotService.getOneScriptById(id);
	}

	@ApiResponse({
		description: SwaggerComments.GET_ALL_STRUCTURE,
		status: 200,
		type: [StructureEntity],
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('structure')
	async getAllStruct() {
		return await this.chatBotService.getAllStruct();
	}

	@ApiResponse({
		description: SwaggerComments.GET_STRUCTURE_BY_ID,
		status: 200,
		type: StructureEntity,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('structure/:id')
	async getStructById(@Param('id') id: number) {
		return await this.chatBotService.getStructById(id);
	}

	@ApiResponse({ status: 200, type: UpdateAssetResponseDto })
	@ApiBody({
		type: UpdateAssetResponseDto,
		description: SwaggerComments.UPDATE_CHATBOT,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async updateChatBot(
		@Param('id') id: number,
		@Body() updateData: UpdateChatbotForFrontDTO
	) {
		return await this.chatBotService.update(id, updateData);
	}

	@ApiResponse({ status: 201 })
	@ApiBody({
		type: ImportPageDto,
		description: SwaggerComments.IMPORT_PAGE,
	})
	@UseGuards(JwtAuthGuard)
	@Post('import-page')
	async importPage(@Body() dto: ImportPageDto, @Req() req: any) {
		const user = req.user;
		return await this.chatBotService.importPage(user, dto);
	}

	@ApiHeader({
		name: 'content-type:multipart/form-data',
	})
	@ApiBody({
		description: SwaggerComments.UPLOAD_IMAGE,
		type: UploadImageDto,
	})
	@ApiResponse({
		status: 200,
		type: ChatBotDto,
	})
	@Patch('upload-image/:id')
	@UseInterceptors(FileInterceptor('image'))
	async uploadImage(
		@Param('id') id: number,
		@UploadedFile() file: Express.Multer.File
	): Promise<ChatBotEntity> {
		const asset = await this.aistaChatbotService.findOneById(id);
		if (!asset) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}
		return await this.chatBotService.uploadImage(asset.id, file);
	}

	@ApiBody({
		description: SwaggerComments.UPLOAD_IMAGE,
		type: UploadImageDto,
	})
	@ApiResponse({
		status: 200,
		type: ChatBotDto,
	})
	@Patch('upload-image/base64/:id')
	async uploadImageBase64(
		@Param('id') id: number,
		@Body('file') file: string
	): Promise<ChatBotEntity> {
		const asset = await this.aistaChatbotService.findOneById(id);
		if (!asset) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}

		return await this.chatBotService.uploadImage(asset.id, file);
	}

	@ApiResponse({ status: 200 })
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete()
	async deleteAssets(@Query('assetId') assetId: string, @Req() req: any) {
		try {
			const { id } = req.user;
			await this.chatBotService.deleteAsset(id, Number(assetId));
		} catch (e) {
			throw new NotFoundException(ErrorMessages.chatbot.CHATBOT_NOT_FOUND);
		}
	}

	@ApiResponse({
		description: SwaggerComments.GET_ALL_CHATBOTS,
		status: 200,
		type: [ChatBotEntity],
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('get-all')
	async getAllChatBot(@Req() req: any) {
		return await this.chatBotService.getAllAsset(req.user.id);
	}

	@ApiResponse({
		status: 200,
		type: ChatBotEntity,
		description: SwaggerComments.GET_ONE_CHATBOT,
	})
	@ApiParam({
		name: 'id',
		description: 'chatbot id',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('get-one/:id')
	async findOneById(
		@Param('id') id: number,
		@Req() req: any
	): Promise<ChatBotEntity> {
		const chatBot = await this.aistaChatbotService.findOneById(id);
		if (chatBot.user.id !== req.user.id) {
			throw new UnauthorizedException(
				'You trying to get chatbot that not belong to you'
			);
		}
		return chatBot;
	}

	@ApiResponse({
		status: 200,
		type: 'asset  blocked',
	})
	@ApiParam({
		name: 'type',
		description: SwaggerComments.BLOCKED_ASSET,
		example: 'name_com',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch('/blocked/:type')
	async blockedAsset(@Param('type') type: string) {
		await this.aistaChatbotService.blockedAsset(type);
	}

	@ApiResponse({
		status: 200,
		type: 'asset unblocked',
	})
	@ApiParam({
		name: 'type',
		description: SwaggerComments.UNBLOCKED_ASSET,
		example: 'name_com',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch('/unblocked/:type')
	async unblockedAsset(@Param('type') type: string) {
		await this.aistaChatbotService.unblockedAsset(type);
	}

	@ApiResponse({
		status: 200,
		type: ChatBotEntity,
		description: SwaggerComments.GET_SNIPPET_BY_ID,
	})
	@ApiQuery({
		name: 'page',
		required: false,
		description: 'page number',
	})
	@ApiQuery({
		name: 'perPage',
		required: false,
		description: 'per Page number',
	})
	@ApiQuery({
		required: false,
		name: 'search',
		description:
			'search by prompt, completion, uri. Just pass the query string',
	})
	@ApiQuery({
		required: false,
		name: 'chatBotIDs',
		description: 'search by chatBotIDs, you can set one or multiple',
		example: '1,2,3',
	})
	@ApiQuery({
		required: false,
		name: 'order',
		description:
			'order by any column, DESC or ASC. DESC means descending, ASC means ascending',
		example: 'id,DESC',
		enum: [
			'id,DESC',
			'prompt,ASC',
			'created,DESC',
			'this is example you can set any column and order',
		],
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('training-snippets')
	async getTrainingSnippets(@Query() query: any, @Req() req: any) {
		return await this.aistaChatbotService.snippetsSearch(query, req.user);
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.EDIT_SNIPPET_BY_ID,
	})
	@ApiParam({
		name: 'id',
		description: 'chatbot id',
	})
	@Roles('admin', 'user')
	@ApiBody({ type: UpdateTrainingSnippetDto })
	@UseGuards(JwtAuthGuard)
	@Patch('training-snippets/:id')
	async editTrainingSnippet(
		@Param('id') id: string,
		@Body() body: UpdateTrainingSnippetDto
	) {
		return await this.aistaChatbotService.editTrainingSnippet(Number(id), body);
	}

	@ApiResponse({
		status: 200,
		type: Object,
		description: '{"id":1}',
	})
	@ApiParam({
		name: 'id',
		description: 'id chatbot',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Post('training-snippets/:id')
	async addTrainingSnippet(
		@Body() dto: MLTrainingSnippet,
		@Param('id') id: number
	) {
		const newTrainingSnippetId =
			await this.aistaChatbotService.addTrainingSnippet(id, dto);
		return { id: newTrainingSnippetId };
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETE_SNIPPET_BY_ID,
	})
	@ApiParam({
		name: 'id',
		description: 'snippet id',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete('training-snippets/:id')
	async deleteTrainingSnippet(@Param('id') id: string) {
		await this.aistaChatbotService.deleteTrainingSnippet(Number(id));
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETE_SNIPPET_BY_IDS_SNIPPET,
	})
	@ApiBody({
		description: 'ids',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete('training-snippets')
	async deleteTrainingSnippetsByIds(@Body('ids') ids: number[]) {
		await this.aistaChatbotService.deleteTrainingSnippetsByIds(ids);
	}

	@ApiResponse({
		status: 200,
	})
	@ApiParam({
		name: 'chatbotId',
		description: 'chatbot id',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete('training-snippets/all/:chatbotId')
	async deleteAllTrainingSnippet(@Param('chatbotId') chatbotId: number) {
		return await this.aistaChatbotService.deleteAllSnippetsByChatBotId(
			chatbotId
		);
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.START_VECTORISE,
	})
	@ApiParam({
		name: 'id',
		description: 'chatbot id',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('training-snippets/vectorise/:id')
	async vectoriseChatbotSnippets(@Param('id') id: string) {
		await this.aistaChatbotService.startVectorise(Number(id));
	}

	@ApiResponse({
		status: 200,
		type: AnswerChatOpenAiDto,
		description: SwaggerComments.ASK_GPT_CHAT,
	})
	@ApiParam({
		name: 'prompt',
		example: 'coderfy is a platform for developers?',
		description: 'Questions for your chatbot',
	})
	@ApiParam({
		name: 'references',
		example: 'true/false',
		description: 'Add link to answer for questions',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Post('chat/:id')
	async getChatResult(
		@Body() body: AskChatOpenAiDto,
		@Param('id') assetId: number
	): Promise<{ result: string }> {
		const snipet = await this.aistaChatbotService.askChatOpenAi(body, assetId);
		return snipet;
	}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.CHATBOT_FOOTER,
	})
	@ApiParam({
		name: 'id',
		description: 'Chatbot id',
	})
	@Get('footer/:name')
	async getFooter(@Param('name') name: string) {
		const footer = await this.aistaChatbotService.getFooter(name);
		return footer;
	}

	@ApiResponse({
		status: 200,
		type: UsageStatisticsResponseDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('usage-statistics')
	async getUsageStatistics(@Req() req: any) {
		return await this.chatBotService.getUsageStatistics(req.user);
	}

	@ApiResponse({
		status: 200,
		type: ChatBotEntity,
		description: SwaggerComments.GET_REQUEST_HISTORY_BY_IDs,
	})
	@ApiQuery({
		name: 'page',
		required: false,
		description: 'page number',
	})
	@ApiQuery({
		name: 'perPage',
		required: false,
		description: 'per Page number',
	})
	@ApiQuery({
		required: false,
		name: 'search',
		description: 'search by prompt and completion. Just pass the query string',
	})
	@ApiQuery({
		required: false,
		name: 'from',
		description: 'search by from date',
	})
	@ApiQuery({
		required: false,
		name: 'to',
		description: 'search by to date',
	})
	@ApiQuery({
		required: false,
		name: 'chatBotIDs',
		description: 'search by chatBotIDs, you can set one or multiple',
		example: '1,2,3',
	})
	@ApiQuery({
		required: false,
		name: 'order',
		description:
			'order by any column, DESC or ASC. DESC means descending, ASC means ascending',
		example: 'id,DESC',
		enum: [
			'id,DESC',
			'prompt,ASC',
			'created,DESC',
			'this is example you can set any column and order',
		],
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('history')
	async findChatBotHistoryById(@Query() query: any, @Req() req: any) {
		return await this.aistaChatbotService.getHistoryByChatbotId(
			query,
			req.user
		);
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_USER_INFO,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('/snippets/export/:id/:type')
	async exportLeads(
		@Param('type') type: 'csv' | 'xlsx',
		@Param('id') id: string
	) {
		const url = await this.aistaChatbotService.exportSnippets(type, Number(id));
		return { url };
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.EXPORT_BY_IDS_SNIPPETS,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Post('/snippets/export/:type')
	async exportLeadsByIds(
		@Param('type') type: 'csv' | 'xlsx',
		@Body('ids') ids: number[]
	) {
		const url = await this.aistaChatbotService.exportSnippetsByIds(type, ids);
		return { url };
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_USER_INFO,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@UseInterceptors(FileInterceptor('file'))
	@Post('snippets/import/:id')
	async importLeads(
		@UploadedFile() file: Express.Multer.File,
		@Param('id') id: string
	) {
		await this.aistaChatbotService.importSnippets(file, Number(id));
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_COUNT_NOT_VECTORIZED_SNIPPETS,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('/snippets/not-vectorized/:id')
	async getCountNotVectSnippets(@Param('id') id: string) {
		const [data] = await this.aistaChatbotService.getCountNotVectSnippets(
			Number(id)
		);
		return { count: data.count };
	}

	@ApiResponse({
		status: 202,
		type: Object,
		description: 'affected: 1',
	})
	@ApiParam({
		name: 'chatbotId',
		description: 'chatbot id',
	})
	@ApiBody({ type: UpdateMlTypeDto })
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch('ml-type/:chatbotId')
	async configurationMlType(
		@Param('chatbotId') id: number,
		@Body() dto: UpdateMlTypeDto
	) {
		return await this.aistaChatbotService.configurationMlType(id, dto);
	}

	@ApiResponse({
		status: 202,
		type: MLType,
	})
	@ApiParam({
		name: 'chatbotId',
		description: 'chatbot id',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('ml-type/:chatbotId')
	async getMlTypeById(@Param('chatbotId') id: number) {
		return await this.aistaChatbotService.getMlTypeById(id);
	}

	@ApiResponse({
		status: 202,
		description: SwaggerComments.GET_ALL_MODELS,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('openai/models')
	async getOpenAIModels() {
		return await this.aistaChatbotService.getModels();
	}
}
