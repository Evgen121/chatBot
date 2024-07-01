import { Module } from '@nestjs/common';
import { ChatbotPlanService } from './services/chatbotPlan.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity, UserEntity } from '@db/entities';

@Module({
	imports: [TypeOrmModule.forFeature([ProductEntity, UserEntity])],
	providers: [ChatbotPlanService],
	exports: [ChatbotPlanService],
})
export class PlanModule {}
