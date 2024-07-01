import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CssStyleEntity, ScriptEntity, UserEntity } from '@db/entities';
import { StyleController } from './style.controller';
import { StyleService } from './style.srvice';
import { SharedModule } from '@modules/shared/shared.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([CssStyleEntity, ScriptEntity, UserEntity]),
		SharedModule,
	],
	controllers: [StyleController],
	providers: [StyleService, ConfigService],
	exports: [StyleService],
})
export class StyleModule {}
