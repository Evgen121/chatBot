import { Module } from '@nestjs/common';
import { AistaService } from './services/aista.service';
import { ConfigModule } from '@nestjs/config/dist';
import { TokenService } from './services/token.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { OpenAiService } from './services/openAi.service';
import { TaskSchedulerService } from './services/taskScheduler.service';
import { NotificationService } from './services/notifications.service';
import { ChatBotService } from '../chatBot/services/chatBot.service';
import { UserService } from '../user/user.service';
import { UploadService } from './services/upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	ChatBotEntity,
	CssStyleEntity,
	ScriptEntity,
	LeadsEntity,
	PaymentEntity,
	ProductEntity,
	RectokenEntity,
	UserEntity,
	StructureEntity,
	RoleEntity,
	ChatbotScriptRequestEntity,
	PromoCode,
	InstructionUrlEntity,
} from '@db/entities';
import { AistaChatbotService } from '../chatBot/services/aistaChatbot.service';
import { MLRequest, MLTrainingSnippet, MLType } from '@db/aistaEnities';
import { ChatbotUserLimitService } from './services/chatbotUserLimit.service';
import { LeadsService } from '../leads/leads.service';
import { DocsService } from './services/docs.service';
import { PaymentService } from '../payment/payment.service';
import { TOTPService } from './services/totp.service';
import { AdminProductService } from '../admin/product/product.service';
import { RecaptchaService } from './services/recaptcha.service';
import { PlanModule } from '../plan/plan.module';
import { EmailModule } from '../email/email.module';
import { RoleModule } from '../role/role.module';
import { AuthService } from '../auth/services/auth.service';

const services = [
	AuthService,
	AistaService,
	TokenService,
	OpenAiService,
	TaskSchedulerService,
	NotificationService,
	UserService,
	UploadService,
	ChatbotUserLimitService,
	DocsService,
	ChatBotService,
	AistaChatbotService,
	LeadsService,
	AdminProductService,
	TOTPService,
	PaymentService,
	RecaptchaService,
	JwtService,
];

@Module({
	imports: [
		TypeOrmModule.forFeature([MLType, MLRequest, MLTrainingSnippet], 'aista'),
		TypeOrmModule.forFeature([
			UserEntity,
			ChatBotEntity,
			LeadsEntity,
			RoleEntity,
			ScriptEntity,
			ChatbotScriptRequestEntity,
			StructureEntity,
			ProductEntity,
			RectokenEntity,
			CssStyleEntity,
			PaymentEntity,
			ChatbotScriptRequestEntity,
			PromoCode,
			InstructionUrlEntity,
		]),
		ConfigModule,
		PlanModule,
		RoleModule,
		EmailModule,
		JwtModule.register({}),
	],
	controllers: [],
	providers: services,
	exports: services,
})
export class SharedModule {}
