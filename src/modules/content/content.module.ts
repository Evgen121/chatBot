import { Module } from '@nestjs/common/decorators';
import { ContentController } from './controllers/content.controller';
import { ContentService } from './services/content.service';
import { SharedModule } from '@shared/shared.module';
import { ConfigService } from '@nestjs/config/dist/config.service';
import {
	ContentEntity,
	OptionalTitleEntity,
	SubjectEntity,
	UserEntity,
} from '@db/entities';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			ContentEntity,
			OptionalTitleEntity,
			UserEntity,
			SubjectEntity,
		]),
		SharedModule,
	],
	controllers: [ContentController],
	providers: [ContentService, ConfigService],
	exports: [ContentService],
})
export class ContentModule {}
