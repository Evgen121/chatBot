import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from 'sib-api-v3-sdk';
import * as mustache from 'mustache';
import * as fs from 'fs';
import { ErrorMessages } from '@utils/errors/errors';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailTemplateEntity, EmailTracking } from '@db/entities';
import { Repository } from 'typeorm';
import { EmailTemplate } from './emailTemplate.enum';
import { EmailTemplateDto } from './dto/EmailTemplateDto';
import { UniqueIdService } from '../shared/services/uniqueIdService.service';

@Injectable()
export class SendEmailService {
	private readonly apiInstance: SibApiV3Sdk.TransactionalEmailsApi;
	private readonly defaultClient: SibApiV3Sdk.ApiClient.instance;

	constructor(
		private readonly configService: ConfigService,
		private readonly uniqueIdService: UniqueIdService,
		@InjectRepository(EmailTemplateEntity)
		private readonly emailTemplateRepository: Repository<EmailTemplateEntity>,
		@InjectRepository(EmailTracking)
		private readonly emailTrackingRepository: Repository<EmailTracking>
	) {
		this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
		this.defaultClient = SibApiV3Sdk.ApiClient.instance;
		this.defaultClient.authentications['api-key'].apiKey =
			this.configService.get('sendgrid.sendgrid');
	}

	async sendEmailByTemplate(template: EmailTemplate, data: any) {
		const emailTemplate = await this.getTemplate(template);
		const completeEmail = mustache.render(emailTemplate.template, data);
		await this.sendEmail(emailTemplate.subject, completeEmail, data.email);
	}

	async sendEmailByTemplateForLead(template: EmailTemplate, data: any) {
		try {
			const emailTemplate = await this.getTemplate(template);
			const uniqueId = this.uniqueIdService.generateUniqueId();
			data.logoUrl = `${process.env.HOST_BACKEND}email/tracking?uniqueId=${uniqueId}`;
			const completeEmail = mustache.render(emailTemplate.template, data);
			await this.sendEmail(emailTemplate.subject, completeEmail, data.email);

			const emailStatus = new EmailTracking();
			emailStatus.id = uniqueId;
			emailStatus.email = data.email;
			emailStatus.username = data.username;
			emailStatus.opened = false;
			await this.emailTrackingRepository.save(emailStatus);
		} catch (error) {
			console.log('error', error);
		}
	}

	async getTemplate(template: EmailTemplate) {
		const emailTemplate = await this.emailTemplateRepository.findOne({
			where: {
				name: template,
			},
		});
		return new EmailTemplateDto(emailTemplate);
	}

	async sendEmail(subject: string, htmlContent: string, email: string) {
		try {
			const sendSmtpEmail = {
				subject,
				htmlContent,
				sender: { email: process.env.FROM_EMAIL, name: 'Coderfy' },
				to: [{ email, name: 'Dear User' }],
			};

			await this.apiInstance.sendTransacEmail(sendSmtpEmail);
		} catch (e) {
			throw new InternalServerErrorException(
				ErrorMessages.email.EMAIL_SEND_FAILED
			);
		}
	}

	async markEmailAsOpened(uniqueId: string, res: any) {
		const emailStatus = await this.emailTrackingRepository.findOne({
			where: { id: uniqueId },
		});
		if (emailStatus) {
			emailStatus.opened = true;
			await this.emailTrackingRepository.save(emailStatus);
		}
		const file = fs.readFileSync(process.env.PATH_TO_TRACKING_LOGO);
		res.end(file);
		return;
	}
}
