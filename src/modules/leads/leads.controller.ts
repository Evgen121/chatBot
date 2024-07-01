import {
	Controller,
	UseGuards,
	Post,
	UseInterceptors,
	UploadedFile,
	Get,
	Param,
	Query,
	NotFoundException,
	Delete,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { Roles } from '@utils/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Leads')
@Controller('leads')
export class LeadsController {
	constructor(private readonly leadsService: LeadsService) {}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_USER_INFO,
	})
	@Roles('admin')
	@UseInterceptors(FileInterceptor('file'))
	@Post('import')
	async importLeads(@UploadedFile() file: Express.Multer.File) {
		await this.leadsService.importLeads(file);
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_LEAD_INFO,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get('/export/:type')
	async exportLeads(@Param('type') type: 'csv' | 'xlsx') {
		return await this.leadsService.exportLeads(type);
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_LEAD_INFO,
	})
	@Roles('admin')
	@Get()
	async getAllLeads(@Query() query: any) {
		const { total, data } = await this.leadsService.getAllLeads(query);
		return { total, data };
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_LEAD_INFO_BY_ID,
	})
	@Get(':id')
	async getLeadById(@Param('id') id: number) {
		const lead = await this.leadsService.getLeadById(id);
		if (!lead) {
			throw new NotFoundException('Lead not found');
		}
		return lead;
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETED_LEAD_INFO_BY_ID,
	})
	@Delete(':id')
	async deleteLeadById(@Param('id') id: number) {
		const deletedLead = await this.leadsService.deleteLeadById(id);
		if (!deletedLead) {
			throw new NotFoundException('Lead not found');
		}
		return { message: 'Lead deleted successfully' };
	}
}
