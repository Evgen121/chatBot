import { Module } from '@nestjs/common';
import { FeedbackService } from './feedbackAdmin.service';
import { FeedbackController } from './feedbackAdmin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackEntity, UserEntity } from '@db/entities';
import { SharedModule } from '@modules/shared/shared.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([FeedbackEntity, UserEntity]),
		SharedModule,
	],
	controllers: [FeedbackController],
	providers: [FeedbackService],
	exports: [FeedbackService],
})
export class FeedbackAdminModule {}
