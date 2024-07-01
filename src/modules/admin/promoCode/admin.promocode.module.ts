import { PromoCode, UserEntity } from '@/src/db/entities';
import { Module } from '@nestjs/common';
import { PromocodeController } from './admin.promocode.controller';
import { AdminPromocodeService } from './admin.promocode.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '../../shared/shared.module';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity, PromoCode, SharedModule])],
	controllers: [PromocodeController],
	providers: [AdminPromocodeService],
	exports: [AdminPromocodeService],
})
export class AdminPromocodeModule {}
