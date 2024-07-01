import { Module } from '@nestjs/common';
import { AdminController } from './admin.user.controller';
import { AdminUserService } from './admin.user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatBotEntity, ContentEntity, UserEntity } from '@db/entities';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '@modules/shared/services/token.service';
import { JwtService } from '@nestjs/jwt';
import { AistaService } from '@modules/shared/services/aista.service';
import { TOTPService } from '@modules/shared/services/totp.service';
import { EmailModule } from '@modules/email/email.module';
import { UserModule } from '@modules/user/user.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, ChatBotEntity, ContentEntity]),
		EmailModule,
		UserModule,
	],
	controllers: [AdminController],
	providers: [
		AdminUserService,
		AistaService,
		ConfigService,
		TokenService,
		JwtService,
		TOTPService,
	],
	exports: [AdminUserService],
})
export class AdminUserModule {}
