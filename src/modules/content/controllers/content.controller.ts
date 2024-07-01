import {
	Body,
	Controller,
	Delete,
	Get,
	Put,
	Post,
	Req,
	UseGuards,
	Request,
	Query,
	Patch,
	NotFoundException,
	BadRequestException,
	InternalServerErrorException,
	ForbiddenException,
	ConflictException,
	Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { CreateContentDto } from '../dto/createContentDto';
import { ContentService } from '../services/content.service';
import { ApiTags, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { ErrorMessages } from '@utils/errors/errors';
import { CreateOptionalTitleDto } from '../dto/createOptionalTitleDto';
import { ContentEntity } from '@db/entities';
import { CreateHtmlContentDto } from '../dto/createHtmlContentDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { ContentGuard } from '@utils/guards/content.guard';
import { createWithSubjectContentDto } from '../dto/createWithSubjectContentDto';
import { CreateSubjectContentDto } from './../dto/createSubjectContentDto';
import { CreateContentResponseDto } from '../dto/createResponseDto';
import { SubjectResponseDto } from '../dto/subjectResponseDto';
import { ContentResponseDto } from '../dto/contentResponseDto';
import { SubjectUpdateResponseDto } from '../dto/subjectUpdateResponseDto';

@ApiTags('Content')
@Controller('content')
export class ContentController {
	constructor(private readonly contentService: ContentService) {}

	@ApiBody({
		type: CreateContentDto,
		description: SwaggerComments.CREATE_CONTENT,
	})
	@Roles('admin', 'user')
	@ApiResponse({
		status: 201,
		description: 'The content has been successfully created.',
		type: ContentResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request. Some input parameters are invalid.',
	})
	@UseGuards(JwtAuthGuard, ContentGuard)
	@Post('create')
	async createContent(@Request() req, @Body() body: CreateContentDto) {
		try {
			const result = await this.contentService.generateContent(body, req.user);
			return result;
		} catch (error) {
			throw new BadRequestException(
				'Bad request. Some input parameters are invalid.'
			);
		}
	}

	@ApiBody({
		description: SwaggerComments.CREATE_CONTENT_WITH_SUBJECT_DIALOG,
		type: createWithSubjectContentDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard, ContentGuard)
	@Post('content-with-subject')
	@ApiResponse({
		status: 201,
		description: 'The content with subject has been successfully created.',
		type: CreateContentResponseDto,
	})
	@ApiResponse({
		status: 400,
		description: 'Bad request. Some input parameters are invalid.',
	})
	async createContentWithSubject(
		@Body() dto: createWithSubjectContentDto,
		@Req() req: any
	) {
		try {
			const result = await this.contentService.createContentWithSubject(
				dto,
				req.user
			);
			return result;
		} catch (error) {
			throw new BadRequestException(
				'Bad request. Some input parameters are invalid.'
			);
		}
	}

	@ApiBody({
		description: SwaggerComments.CREATE_SUBJECT,
		type: CreateSubjectContentDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard, ContentGuard)
	@Post('subject')
	@ApiResponse({
		status: 201,
		description: 'The subject has been successfully created.',
		type: SubjectResponseDto,
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict. The subject already exists.',
	})
	async createSubject(@Body() dto: CreateSubjectContentDto, @Req() req: any) {
		try {
			const result = await this.contentService.createSubject(dto, req.user);
			return result;
		} catch (error) {
			throw new BadRequestException(
				'Bad request. Some input parameters are invalid.'
			);
		}
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard, ContentGuard)
	@ApiParam({
		name: 'id',
		description: 'The unique identifier of the subject to delete',
		example: '9330b14c-8b23-4d64-a930-f97a0256a96d',
	})
	@ApiResponse({
		status: 200,
		description: 'The subject has been successfully deleted.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. The specified subject does not exist.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden. The user is not allowed to delete this subject.',
	})
	@Delete('subject/:id')
	async deleteSubject(@Param('id') id: string, @Req() req: any) {
		try {
			await this.contentService.deleteSubject(id, req.user);
			return {
				success: true,
				message: 'The subject has been successfully deleted.',
			};
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException(
					'Not Found. The specified subject does not exist.'
				);
			} else if (error instanceof ConflictException) {
				throw new ForbiddenException(
					'Forbidden. The user is not allowed to delete this subject.'
				);
			} else {
				throw new InternalServerErrorException('Internal Server Error');
			}
		}
	}

	@ApiBody({
		type: CreateSubjectContentDto,
		description: SwaggerComments.UPDATE_SUBJECT,
	})
	@ApiResponse({
		status: 200,
		description: 'The subject has been successfully updated.',
		type: SubjectUpdateResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. The subject with the provided ID does not exist.',
	})
	@ApiResponse({
		status: 409,
		description: 'Conflict. The subject could not be updated.',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch('subject/:id')
	async updateSubject(
		@Query('id') id: string,
		@Body() dto: CreateSubjectContentDto,
		@Req() req: any
	) {
		try {
			const result = await this.contentService.updateSubject(id, dto, req.user);
			return result;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException(
					'Not Found. The subject with the provided ID does not exist.'
				);
			} else if (error instanceof ConflictException) {
				throw new ConflictException(
					'Conflict. The subject could not be updated.'
				);
			} else {
				throw new InternalServerErrorException('Internal Server Error');
			}
		}
	}

	@ApiResponse({
		status: 200,
		description: 'Returns the subjects for the user.',
	})
	@ApiResponse({
		status: 400,
		description: 'No subjects found for the user.',
	})
	@ApiParam({
		name: 'name',
		required: false,
		description: 'Filter subjects by name (case-insensitive).',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('subject')
	async getAllSubjectByUser(@Req() req: any, @Query('name') query?: string) {
		try {
			const userId = req.user.id;

			const subjects = await this.contentService.getAllSubjectsByUser(
				userId,
				query
			);

			return subjects;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException('No subjects found for the user.');
			} else {
				throw new Error('Internal Server Error');
			}
		}
	}

	@ApiResponse({ status: 201, type: ContentEntity })
	@ApiBody({
		description: SwaggerComments.CREATE_HTML_CONTENT,
		type: CreateHtmlContentDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard, ContentGuard)
	@Post('create/html')
	async createHtmlContent(@Request() req, @Body() body: CreateHtmlContentDto) {
		return await this.contentService.generateHtmlStyledContent(body, req.user);
	}

	@ApiBody({
		description: SwaggerComments.CREATE_OPTIONAL_TITLE,
		type: CreateOptionalTitleDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard, ContentGuard)
	@Post('create/optional-title')
	async createOptionalTitle(@Body() body: CreateOptionalTitleDto) {
		return await this.contentService.generateOptionalTitle(body);
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@ApiParam({
		name: 'id',
		type: String,
		description: 'The unique identifier of the content entity',
		example: '9330b14c-8b23-4d64-a930-f97a0256a96d',
	})
	@ApiResponse({
		status: 200,
		description: 'The content has been successfully retrieved.',
		type: CreateContentResponseDto,
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. The content with the provided ID does not exist.',
	})
	@Get('/:id')
	async getContentById(@Req() req: any) {
		try {
			const result = await this.contentService.getContentById(req.params.id);
			return result;
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException(
					'Not Found. The content with the provided ID does not exist.'
				);
			} else {
				throw new InternalServerErrorException('Internal Server Error');
			}
		}
	}

	@ApiParam({
		name: 'id',
		description: 'The unique identifier of the subject to delete',
		example: '9330b14c-8b23-4d64-a930-f97a0256a96d',
	})
	@ApiResponse({
		status: 200,
		description: 'The content has been successfully deleted.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. The specified content does not exist.',
	})
	@ApiResponse({
		status: 403,
		description: 'Forbidden. The user is not allowed to delete this content.',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete('/:id')
	async deleteContentById(@Req() req: any) {
		try {
			await this.contentService.deleteContentById(req.params.id);
			return {
				success: true,
				message: 'The content has been successfully deleted.',
			};
		} catch (error) {
			if (error instanceof NotFoundException) {
				throw new NotFoundException(
					'Not Found. The specified content does not exist.'
				);
			} else if (error instanceof ConflictException) {
				throw new ForbiddenException(
					'Forbidden. The user is not allowed to delete this content.'
				);
			} else {
				throw new InternalServerErrorException('Internal Server Error');
			}
		}
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@ApiParam({
		name: 'id',
		description: 'The unique identifier of the content entity',
		type: 'string',
	})
	@ApiResponse({
		status: 200,
		description: 'The content has been successfully updated.',
	})
	@ApiResponse({
		status: 404,
		description: 'Not Found. The content with the provided ID does not exist.',
	})
	@Put('/:id')
	async updateContentById(
		@Req() req: any,
		@Body() content: Partial<ContentEntity>
	) {
		try {
			return await this.contentService.updateContentById(
				req.params.id,
				content
			);
		} catch {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@ApiResponse({
		status: 200,
		description: 'Successfully retrieved the list of contents for the user.',
		type: ContentResponseDto,
		isArray: true,
	})
	@ApiParam({
		name: 'id',
		description: 'User ID',
		type: 'integer',
		example: 1,
	})
	@Get()
	async getAllContent(@Request() req) {
		try {
			return await this.contentService.getAllContentsByUserId(req.user.id);
		} catch {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@ApiResponse({
		status: 200,
		description:
			'Successfully retrieved the list of contents for the user and subject.',
		type: CreateContentResponseDto,
		isArray: true,
	})
	@ApiParam({
		name: 'subjectId',
		description: 'Subject ID',
		type: 'string',
		example: '472618b2-f0ba-4170-8194-3474eb773935',
	})
	@Get('subject/:subjectId')
	async getAllContentByUserBySubject(
		@Req() req: any,
		@Param('subjectId') subjectId: string
	) {
		const userId = req.user.id;

		try {
			return await this.contentService.getAllContentsByUserAndSubject(
				userId,
				subjectId
			);
		} catch {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
	}
}
