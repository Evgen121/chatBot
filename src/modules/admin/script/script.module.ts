import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScriptEntity, UserEntity } from '@db/entities';
import { ScriptController } from './script.controller';
import { SharedModule } from '@modules/shared/shared.module';
import { ScriptService } from './script.service';

@Module({
	imports: [TypeOrmModule.forFeature([ScriptEntity, UserEntity]), SharedModule],
	controllers: [ScriptController],
	providers: [ScriptService, ConfigService],
	exports: [ScriptService],
})
export class ScriptModule {}
