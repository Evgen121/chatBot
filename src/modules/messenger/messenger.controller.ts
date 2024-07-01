import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { CreateMessengerBotDto } from './dto/CreateMessengerBotDto';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { Roles } from '@utils/decorators/roles.decorator';
import { UpdateMessengerBotDto } from './dto/UpdateMessengerBotDto';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { ViberBotService } from './services/viber.service';
import { FacebookMessengerSerivce } from './services/facebookMessenger.service';
import { WhatsAppService } from './services/whatsapp.service';

@ApiTags('Messenger')
@Controller('messenger')
export class MessengerController {
	constructor(
		private readonly messengerService: MessengerService,
		private readonly viberService: ViberBotService,
		private readonly facebookMessengerService: FacebookMessengerSerivce,
		private readonly whatsappService: WhatsAppService
	) {}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('bots')
	async getBots(@Query() query: any, @Req() req: any) {
		return await this.messengerService.getBots(query, req.user.id);
	}

	@ApiBody({
		type: CreateMessengerBotDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Post('create-bot')
	async addBotTokens(@Body() dto: CreateMessengerBotDto, @Req() req: any) {
		await this.messengerService.createBot(dto, req.user.id);
	}

	@ApiParam({
		name: 'id',
		example: 2,
		description: 'Id of the bot you want to delete',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete('bot/:id')
	async deleteBot(@Param('id') messengerBot: number, @Req() req: any) {
		await this.messengerService.deleteBot(messengerBot, req.user.id);
	}

	@ApiParam({
		name: 'id',
		example: 2,
		description: 'Id of the bot you want to update',
	})
	@ApiBody({
		type: UpdateMessengerBotDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch('bot/:id')
	async updateBot(
		@Body() dto: UpdateMessengerBotDto,
		@Param('id') telegramBotId: number,
		@Req() req: any
	) {
		await this.messengerService.updateBot(telegramBotId, dto, req.user.id);
	}

	@Post('webhook/viber/:id')
	async viberWebhook(@Param('id') botId: any, @Body() body: any) {
		if (body?.message?.type == 'text') {
			await this.viberService.handleWebhook(botId, body);
		}
	}

	@Post('webhook/messenger/:id')
	async messengerWebhook(@Body() body: any, @Param('id') botId: number) {
		this.facebookMessengerService.webhookHandler(body, botId);
	}

	@Post('webhook/whatsapp/:id')
	async whatsappWebhook(@Body() body: any, @Param('id') botId: number) {
		this.whatsappService.webhookHandler(body, botId);
	}

	@Get('webhook/messenger/:id')
	async messengerWebhookVerification(
		@Param('id') botId: number,
		@Query() query: any
	) {
		return await this.facebookMessengerService.verifyWebhook(botId, query);
	}

	@Get('webhook/whatsapp/:id')
	async whatsappWebhookVerification(
		@Param('id') botId: number,
		@Query() query: any
	) {
		return await this.whatsappService.verifyWebhook(botId, query);
	}
}
