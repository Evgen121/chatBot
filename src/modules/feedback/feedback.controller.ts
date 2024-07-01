import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { CreateFeedbackDto } from './dto/CreateFeedbackDto';
import { FeedbackService } from './feedback.service';
import { ErrorMessages } from '@utils/errors/errors';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { Roles } from '@utils/decorators/roles.decorator';
import { RecapchaGuard } from '@utils/guards/recapcha.guard';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
	constructor(private readonly feedbackService: FeedbackService) {}

	@ApiBody({ type: CreateFeedbackDto })
	@ApiResponse({
		status: 201,
		description: SwaggerComments.FEEDBACK_CREATE,
	})
	@UseGuards(RecapchaGuard)
	@Post('create')
	async createFeedback(@Body() body: CreateFeedbackDto) {
		await this.feedbackService.createFeedback(body);
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@ApiResponse({
		status: 201,
		description: SwaggerComments.FEEDBACK_GET_ALL,
	})
	@Get('all')
	async getAllFeedbacks() {
		try {
			return await this.feedbackService.getAllFeedbacks();
		} catch {
			throw new NotFoundException(ErrorMessages.feedback.NOT_FOUND);
		}
	}
}
