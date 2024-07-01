import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatBotModule } from './modules/chatBot/chatBot.module';
import envConfig from './configs/env.config';
import { postgresConfig, aistaPostgresConfig } from './configs/postgres.config';
import { mongoConfig } from './configs/mongo.config';
import { ContentModule } from './modules/content/content.module';
import { MongooseModule } from '@nestjs/mongoose';
import { LogMessageModule } from './modules/logMessage/logMessage.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailModule } from './modules/email/email.module';
import { RoleModule } from './modules/role/role.module';
import { InitModule } from './modules/init/init.module';
import { AdminChatbotModule } from './modules/admin/chatbot/admin.chatbot.module';
import { AdminUserModule } from './modules/admin/users/admin.user.module';
import { AdminContentModule } from './modules/admin/content/admin.content.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { FeedbackAdminModule } from './modules/admin/feedback/feedbackAdmin.module';
import { AdminProductModule } from './modules/admin/product/product.module';
import { ProductModule } from './modules/product/product.module';
import { LeadsModule } from './modules/leads/leads.module';
import { PlanModule } from './modules/plan/plan.module';
import { PaymentModule } from './modules/payment/payment.module';
import { StyleModule } from './modules/admin/style/style.module';
import { ScriptModule } from './modules/admin/script/script.module';
import { StructureModule } from './modules/admin/structure/structure.module';
import { MessengerModule } from './modules/messenger/messenger.module';
import { TrackingModule } from './modules/admin/tracking/tracking.module';
import { AdminPromocodeModule } from './modules/admin/promoCode/admin.promocode.module';

@Module({
	imports: [
		ConfigModule.forRoot(envConfig),
		TypeOrmModule.forRootAsync(postgresConfig),
		TypeOrmModule.forRootAsync(aistaPostgresConfig),
		MongooseModule.forRootAsync(mongoConfig),
		ScheduleModule.forRoot(),
		UserModule,
		AuthModule,
		ChatBotModule,
		ContentModule,
		LogMessageModule,
		FeedbackModule,
		FeedbackAdminModule,
		EmailModule,
		TrackingModule,
		RoleModule,
		AdminUserModule,
		AdminChatbotModule,
		InitModule,
		AdminContentModule,
		AdminProductModule,
		AdminPromocodeModule,
		ProductModule,
		LeadsModule,
		PlanModule,
		PaymentModule,
		StyleModule,
		ScriptModule,
		StructureModule,
		MessengerModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
