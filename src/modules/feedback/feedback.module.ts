import { Module } from '@nestjs/common/decorators';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { SharedModule } from '@shared/shared.module';
import { UserEntity, FeedbackEntity } from '@db/entities';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([FeedbackEntity, UserEntity]),
		SharedModule,
		EmailModule,
	],
	controllers: [FeedbackController],
	providers: [FeedbackService],
	exports: [FeedbackService],
})
export class FeedbackModule {}
