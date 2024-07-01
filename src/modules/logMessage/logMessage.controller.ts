import {
	Controller,
	Get,
	Query,
	Param,
	UseGuards,
	Delete,
} from '@nestjs/common';
import { LogMessageService } from './logMessage.service';
import { LogMessageDocument } from '@utils/schemas/logMessage.schema';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { SwaggerComments } from '@utils/swagger/swaggerComments';

@ApiTags('Admin_Log_Messages')
@Controller('admin/log')
export class LogMessageController {
	constructor(private readonly logMessageService: LogMessageService) {}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.GET_ALL_LOGS,
	})
	@ApiBody({
		description: SwaggerComments.GET_ALL_LOGS,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getPageLogMessages(
		@Query() query: any
	): Promise<{ data: LogMessageDocument[]; total: number }> {
		const logMessages = await this.logMessageService.getPageLogMessages(query);

		return {
			data: logMessages,
			total: await this.logMessageService.totalLogMessages(),
		};
	}

	@ApiResponse({
		status: 200,
		description: 'get one logMessage ',
	})
	@ApiBody({
		description: SwaggerComments.GET_LOGS_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get('/:id')
	async findOneById(
		@Param('id') _id: string
	): Promise<{ data: LogMessageDocument }> {
		const logMessage = await this.logMessageService.findOneById(_id);
		return logMessage;
	}

	@ApiResponse({
		status: 200,
		description: 'delete all logMessages',
	})
	@ApiBody({
		description: SwaggerComments.DELETE_ALL_LOGS,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete('all')
	async deleteAllLogMessages(): Promise<any> {
		await this.logMessageService.deleteAllLogMessages();
		return { data: [] };
	}
}
