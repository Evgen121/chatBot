import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from '../user/user.module';
import { SharedModule } from '@shared/shared.module';
import { EmailModule } from '../email/email.module';
import { GoogleAuthService } from './services/googleAuth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBotEntity, LeadsEntity, UserEntity } from '@db/entities';
import { GitHubAuthService } from './services/githubAuth.service';
import { FacebookAuthService } from './services/facebookAuth.service';
import { ChatBotModule } from '../chatBot/chatBot.module';
import { ChatBotService } from '../chatBot/services/chatBot.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, ChatBotEntity, LeadsEntity]),
		SharedModule,
		UserModule,
		EmailModule,
		ChatBotModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		GoogleAuthService,
		GitHubAuthService,
		FacebookAuthService,
	],
	exports: [AuthService, GoogleAuthService, FacebookAuthService],
})
export class AuthModule {}
