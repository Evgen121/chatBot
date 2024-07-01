import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MessengerService } from './messenger.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatBotEntity, MessengerBotEntity, UserEntity } from '@db/entities';
import { SharedModule } from '@shared/shared.module';
import { MessengerController } from './messenger.controller';
import { TelegramBotService } from './services/telegram.service';
import { ViberBotService } from './services/viber.service';
import { ChatBotModule } from '../chatBot/chatBot.module';
import { FacebookMessengerSerivce } from './services/facebookMessenger.service';
import { WhatsAppService } from './services/whatsapp.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([MessengerBotEntity, ChatBotEntity, UserEntity]),
		SharedModule,
		ChatBotModule,
	],
	controllers: [MessengerController],
	providers: [
		MessengerService,
		TelegramBotService,
		ViberBotService,
		FacebookMessengerSerivce,
		WhatsAppService,
	],
})
export class MessengerModule implements OnModuleInit, OnModuleDestroy {
	constructor(private readonly messengerService: MessengerService) {}

	onModuleInit() {
		this.messengerService.initBots();
	}

	onModuleDestroy() {
		this.messengerService.destroyBots();
	}
}
