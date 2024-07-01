import {
	Controller,
	Post,
	Body,
	Get,
	Param,
	Patch,
	Delete,
	Query,
	Res,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { ConfirmEmailDto } from './dto/ConfirmEmailDto';
import { EmailService } from './email.service';
import { ResendEmailDto } from './dto/ResendEmailDto';
import { UserWithJwtDto } from '../user/dto/UserWithJwtDto';
import { UpdateEmailTemplateDto } from './dto/UpdateEmailTemplateDto';
import { CreateEmailTemplateDto } from './dto/CreateEmailTemplateDto';
import { EmailTemplateResponseDto } from './dto/EmailTemplateResponseDto';
import { EmailTemplateDto } from './dto/EmailTemplateDto';
import { SendEmailService } from './sendEmail.service';
import { EmailTracking } from '@/src/db/entities';

@ApiTags('Email')
@Controller('email')
export class EmailController {
	constructor(
		private readonly emailService: EmailService,
		private readonly sendEmailService: SendEmailService
	) {}

	@ApiResponse({
		type: EmailTemplateResponseDto,
	})
	@Get('template')
	async getAllTemplates() {
		return this.emailService.getAllTemplates();
	}

	@ApiResponse({
		type: EmailTemplateDto,
	})
	@ApiParam({
		name: 'id',
		description: 'Id of the template you want to get',
	})
	@Get('template/:id')
	async getEmailTemplate(@Param('id') templateId: number) {
		return this.emailService.getEmailTemplate(templateId);
	}

	@ApiBody({
		type: CreateEmailTemplateDto,
	})
	@ApiResponse({
		type: EmailTemplateDto,
	})
	@Post('template')
	async createEmailTemplate(@Body() dto: CreateEmailTemplateDto) {
		return await this.emailService.createEmailTemplate(dto);
	}

	@ApiBody({
		type: UpdateEmailTemplateDto,
	})
	@ApiParam({
		name: 'id',
		description: 'Id of the template you want to update',
	})
	@Patch('template/:id')
	async updateEmailTemplate(
		@Param('id') id: number,
		@Body() dto: UpdateEmailTemplateDto
	) {
		await this.emailService.updateEmailTemplate(id, dto);
	}

	@ApiParam({
		name: 'id',
		description: 'Id of the template you want to delete',
	})
	@Delete('template/:id')
	async deleteEmailTemplate(@Param('id') templateId: number) {
		await this.emailService.deleteEmailTemplate(templateId);
	}

	@ApiBody({ type: ResendEmailDto, description: SwaggerComments.RESEND_EMAIL })
	@ApiResponse({ status: 200, description: 'Resend email' })
	@Post('resend')
	async resendEmail(
		@Body() body: ResendEmailDto
	): Promise<{ message: string }> {
		return await this.emailService.sendEmailConfirmCode(body.email);
	}

	@ApiBody({
		type: ConfirmEmailDto,
		description: SwaggerComments.CONFIRM_EMAIL_WITH_CODE,
	})
	@ApiResponse({
		status: 200,
		type: UserWithJwtDto,
		description: SwaggerComments.CONFIRM_EMAIL_WITH_CODE,
	})
	@Post('confirm')
	async confirmEmail(@Body() body: ConfirmEmailDto): Promise<UserWithJwtDto> {
		return await this.emailService.confirmEmail(body.code, body.email);
	}

	@Get('tracking')
	async trackEmail(@Query('uniqueId') uniqueId: string, @Res() res: any) {
		await this.sendEmailService.markEmailAsOpened(uniqueId, res);
	}
}
