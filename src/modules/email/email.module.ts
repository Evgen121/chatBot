import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailTracking, UserEntity } from '@db/entities';
import { EmailTemplateEntity } from '@db/entities/emailTemplate.entity';
import { SendEmailService } from './sendEmail.service';
import { TokenService } from '@shared/services/token.service';
import { UniqueIdService } from '../shared/services/uniqueIdService.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, EmailTracking, EmailTemplateEntity]),
	],
	controllers: [EmailController],
	providers: [
		EmailService,
		SendEmailService,
		TokenService,
		JwtService,
		ConfigService,
		UniqueIdService,
	],
	exports: [EmailService, SendEmailService],
})
export class EmailModule {}
