import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminProductController } from './product.controller';
import { AdminProductService } from './product.service';
import { ChatBotEntity, ProductEntity, UserEntity } from '@db/entities';
import { TOTPService } from '@modules/shared/services/totp.service';
import { SharedModule } from '@shared/shared.module';
import { EmailModule } from '@modules/email/email.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([ProductEntity, UserEntity, ChatBotEntity]),
		SharedModule,
		EmailModule,
	],
	controllers: [AdminProductController],
	providers: [AdminProductService, TOTPService],
	exports: [AdminProductService],
})
export class AdminProductModule {}
