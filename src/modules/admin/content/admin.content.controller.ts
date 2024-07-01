import {
	Controller,
	Get,
	Query,
	Param,
	Delete,
	NotFoundException,
	UseGuards,
} from '@nestjs/common';
import { AdminContentService } from './admin.content.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { ErrorMessages } from '@utils/errors/errors';
import { ContentEntity } from '@db/entities';
import { Roles } from '@utils/decorators/roles.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('Admin_Content')
@Controller('admin/contents')
export class AdminContentController {
	constructor(
		private readonly adminContentService: AdminContentService,
		@InjectRepository(ContentEntity)
		private readonly contentRepository: Repository<ContentEntity>
	) {}

	@ApiBody({
		description: SwaggerComments.UPDATE_CONTENT_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async findOneById(@Param('id') id: string): Promise<ContentEntity> {
		return await this.adminContentService.getContentById(id);
	}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.GET_ALL_CONTENT,
	})
	@ApiBody({
		description: SwaggerComments.GET_ALL_CONTENT,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllContent(
		@Query() query: any
	): Promise<{ data: ContentEntity[]; total: number }> {
		const { data, total } = await this.adminContentService.getAllContent(query);
		return { data, total };
	}

	@ApiResponse({ status: 200 })
	@ApiBody({
		description: SwaggerComments.DELETE_CHATBOT_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteAssetsAdmin(
		@Query('assetId') assetId: string,
		@Param('id') id: string
	) {
		try {
			const deleteContent = await this.contentRepository.delete({
				id: String(id),
			});
			if (deleteContent.affected === 0) {
				throw new NotFoundException('User not found');
			}
		} catch {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
	}
}
