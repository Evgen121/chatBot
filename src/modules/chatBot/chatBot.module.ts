import { Module } from '@nestjs/common';
import { ChatBotController } from './chatBot.controller';
import { ChatBotService } from './services/chatBot.service';
import { SharedModule } from '@shared/shared.module';
import { ConfigModule } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { MLRequest, MLTrainingSnippet, MLType } from '@db/aistaEnities';
import {
	ChatBotEntity,
	UserEntity,
	LeadsEntity,
	CssStyleEntity,
	ScriptEntity,
	StructureEntity,
	ChatbotScriptRequestEntity,
	InstructionUrlEntity,
} from '@db/entities';
import { AistaChatbotService } from './services/aistaChatbot.service';
import { PlanModule } from '../plan/plan.module';
import { EmailModule } from '../email/email.module';
import { UploadService } from '../shared/services/upload.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			ChatBotEntity,
			UserEntity,
			LeadsEntity,
			CssStyleEntity,
			ScriptEntity,
			StructureEntity,
			ChatbotScriptRequestEntity,
			InstructionUrlEntity,
		]),
		TypeOrmModule.forFeature([MLType, MLTrainingSnippet, MLRequest], 'aista'),
		PlanModule,
		EmailModule,
		SharedModule,
		ConfigModule,
		PlanModule,
		UserModule,
	],
	controllers: [ChatBotController],
	providers: [ChatBotService, AistaChatbotService, UploadService],
	exports: [ChatBotService, AistaChatbotService, UploadService],
})
export class ChatBotModule {}
