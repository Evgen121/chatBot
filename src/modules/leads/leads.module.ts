import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsEntity, UserEntity } from '@db/entities';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { SharedModule } from '@shared/shared.module';

@Module({
	imports: [TypeOrmModule.forFeature([LeadsEntity, UserEntity]), SharedModule],
	controllers: [LeadsController],
	providers: [LeadsService],
	exports: [LeadsService],
})
export class LeadsModule {}
