import {
	Controller,
	Body,
	Post,
	UseGuards,
	Delete,
	Query,
	Get,
	Param,
	Patch,
} from '@nestjs/common';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { ChatBotEntity } from '@db/entities';
import { DeepPartial } from 'typeorm';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { AdminChatBotService } from './admin.chatbot.service';
import { UpdateChatbotDTO } from '@modules/chatBot/dto/UpdateChatbotDto';
import { ChatBotDto } from '@modules/chatBot/dto/ChatbotDto';
import { UpdateAssetResponseDto } from '@modules/chatBot/dto/UpdateAssetResponseDto';
import { CreateAssetResponseDto } from '@modules/chatBot/dto/CreateAssetResponseDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { AistaChatbotService } from '@modules/chatBot/services/aistaChatbot.service';

@ApiTags('Admin_ChatBot')
@Controller('admin/chatbots')
export class ChatBotController {
	constructor(private readonly chatBotService: AdminChatBotService) {}
	private readonly aistaService: AistaChatbotService;
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.GET_ALL_CHATBOT,
	})
	@ApiBody({
		description: SwaggerComments.GET_ALL_CHATBOT,
	})
	@Get()
	async getAllChatbot(
		@Query() query: any
	): Promise<{ total: number; data: ChatBotEntity[] }> {
		const { data, total } = await this.chatBotService.getAllChatBot(query);
		return { total, data };
	}

	@ApiResponse({
		status: 200,
		type: ChatBotEntity,
		description: 'get one chatbot',
	})
	@ApiBody({
		description: SwaggerComments.GET_CHATBOT_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async findOneById(@Param('id') id: number): Promise<ChatBotEntity> {
		const chatBot = await this.chatBotService.findOneById(id);
		return chatBot;
	}

	@ApiResponse({ status: 201, type: CreateAssetResponseDto })
	@ApiBody({
		type: ChatBotDto,
		description: SwaggerComments.CREATE_CHATBOT,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Post('create-bot')
	async createAssetBot(
		@Body() createBot: any
	): Promise<DeepPartial<ChatBotEntity>> {
		return this.chatBotService.createAsset(createBot);
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
		@Body() updateData: UpdateChatbotDTO
	) {
		const chatBot = await this.chatBotService.update(id, updateData);
		return chatBot;
	}

	@ApiResponse({ status: 200 })
	@ApiBody({
		description: SwaggerComments.DELETE_CONTENT_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteAssetsAdmin(@Param('id') id: number) {
		await this.chatBotService.deleteAsset(id);
	}

	@ApiQuery({
		name: 'page',
		type: Number,
		required: false,
		description: 'page',
	})
	@ApiQuery({
		name: 'limit',
		type: Number,
		required: false,
		description: 'limit',
	})
	@ApiQuery({
		name: 'search',
		type: String,
		required: false,
		description: 'search',
	})
	@ApiQuery({
		name: 'sort',
		type: String,
		required: false,
		description: 'sort',
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get('requests/history')
	async getHistory(@Query() query: any) {
		const history = await this.chatBotService.getHistory(query);
		return history;
	}

	@ApiParam({
		name: 'id',
		type: Number,
		required: true,
		description: 'id',
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get('requests/history/:id')
	async getHistoryById(@Param('id') id: number) {
		const history = await this.chatBotService.getHistoryById(id);
		return history;
	}

	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get('usage-statistics/:email')
	async getUsageStatistics(@Param('email') email: string) {
		const usageStatistics = await this.chatBotService.getUsageStatistics(email);
		return usageStatistics;
	}
}
