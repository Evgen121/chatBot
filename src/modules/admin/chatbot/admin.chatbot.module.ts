import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	ChatBotEntity,
	ChatbotScriptRequestEntity,
	CssStyleEntity,
	ScriptEntity,
	StructureEntity,
	UserEntity,
} from '@db/entities';
import { SharedModule } from '@modules/shared/shared.module';
import { UserModule } from '@modules/user/user.module';
import { ChatBotController } from './admin.chatbot.controller';
import { AdminChatBotService } from './admin.chatbot.service';
import { MLRequest, MLTrainingSnippet, MLType } from '@db/aistaEnities';
import { PlanModule } from '@modules/plan/plan.module';
import { EmailModule } from '@modules/email/email.module';
import { ChatBotAnalyticsController } from '../analytics/chatbotAnalytics.controller';
import { ChatbotAnalyticsService } from '../analytics/chatbotAnalytics.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([MLType, MLTrainingSnippet, MLRequest], 'aista'),
		TypeOrmModule.forFeature([
			ChatBotEntity,
			UserEntity,
			CssStyleEntity,
			StructureEntity,
			ScriptEntity,
			CssStyleEntity,
			ChatbotScriptRequestEntity,
		]),
		SharedModule,
		ConfigModule,
		EmailModule,
		UserModule,
		PlanModule,
	],
	controllers: [ChatBotController, ChatBotAnalyticsController],
	providers: [AdminChatBotService, ChatbotAnalyticsService],
	exports: [AdminChatBotService, ChatbotAnalyticsService],
})
export class AdminChatbotModule {}
