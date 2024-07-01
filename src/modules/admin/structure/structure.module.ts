import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CssStyleEntity, StructureEntity, UserEntity } from '@db/entities';
import { StructureController } from './structure.controller';
import { SharedModule } from '@modules/shared/shared.module';
import { StructureService } from './structure.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([StructureEntity, CssStyleEntity, UserEntity]),
		SharedModule,
	],
	controllers: [StructureController],
	providers: [StructureService, ConfigService],
	exports: [StructureService],
})
export class StructureModule {}
