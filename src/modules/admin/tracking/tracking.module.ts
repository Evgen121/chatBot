import { EmailTracking } from '@/src/db/entities';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrackingController } from './tracking.conttroller';
import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';

@Module({
	imports: [TypeOrmModule.forFeature([EmailTracking])],
	controllers: [TrackingController],
	providers: [TrackingService],
})
export class TrackingModule {}
