import { Module } from '@nestjs/common';
import { AdminContentService } from './admin.content.service';
import { AdminContentController } from './admin.content.controller';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentEntity, OptionalTitleEntity, UserEntity } from '@db/entities';
import { SharedModule } from '@modules/shared/shared.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([ContentEntity, OptionalTitleEntity, UserEntity]),
		SharedModule,
	],
	controllers: [AdminContentController],
	providers: [AdminContentService, ConfigService],
	exports: [AdminContentService],
})
export class AdminContentModule {}
