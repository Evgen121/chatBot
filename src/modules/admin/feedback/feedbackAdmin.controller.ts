import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedbackAdmin.service';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { FeedbackEntity } from '@db/entities';

@ApiTags('Admin_FeedBack')
@Controller('admin/feedback')
export class FeedbackController {
	constructor(private readonly feedbackService: FeedbackService) {}

	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@ApiResponse({
		status: 201,
		description: SwaggerComments.FEEDBACK_GET_ALL,
	})
	@ApiBody({
		description: SwaggerComments.FEEDBACK_GET_ALL,
	})
	@Get()
	async getAllFedbacks(
		@Query() query: any
	): Promise<{ total: number; data: FeedbackEntity[] }> {
		const { data, total } = await this.feedbackService.getAllFeedbacks(query);
		return { total, data };
	}

	@ApiResponse({
		status: 200,
		type: FeedbackEntity,
		description: SwaggerComments.FEEDBACK_GET_BY_ID,
	})
	@ApiBody({
		description: SwaggerComments.FEEDBACK_GET_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async findOneById(@Param('id') id: number): Promise<FeedbackEntity> {
		const feedback = await this.feedbackService.findOneById(id);
		return feedback;
	}
}
