import { Injectable } from '@nestjs/common';
import { SendEmailService } from './sendEmail.service';
import { BadRequestException } from '@nestjs/common/exceptions';
import { ErrorMessages } from '@utils/errors/errors';
import { TokenService } from '@shared/services/token.service';
import { UserWithJwtDto } from '../user/dto/UserWithJwtDto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@db/entities';
import { Repository } from 'typeorm';
import { EmailTemplateEntity } from '@db/entities/emailTemplate.entity';
import { CreateEmailTemplateDto } from './dto/CreateEmailTemplateDto';
import { EmailTemplateDto } from './dto/EmailTemplateDto';
import { UpdateEmailTemplateDto } from './dto/UpdateEmailTemplateDto';
import { EmailTemplateResponseDto } from './dto/EmailTemplateResponseDto';
import { EmailTemplate } from './emailTemplate.enum';

@Injectable()
export class EmailService {
	constructor(
		private readonly emailService: SendEmailService,
		private readonly tokenService: TokenService,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		@InjectRepository(EmailTemplateEntity)
		private readonly emailTemplateRepository: Repository<EmailTemplateEntity>
	) {}

	async getAllTemplates() {
		const [emailTemplates, count] =
			await this.emailTemplateRepository.findAndCount();
		return new EmailTemplateResponseDto(emailTemplates, count);
	}
	async getEmailTemplate(templateId: number) {
		const template = await this.emailTemplateRepository.findOne({
			where: {
				id: templateId,
			},
		});
		return new EmailTemplateDto(template);
	}

	async createEmailTemplate(dto: CreateEmailTemplateDto) {
		const template = await this.emailTemplateRepository.save({
			name: dto.name,
			subject: dto.subject,
			template: dto.template,
		});

		return new EmailTemplateDto(template);
	}

	async updateEmailTemplate(id: number, dto: UpdateEmailTemplateDto) {
		await this.emailTemplateRepository.update(id, {
			name: dto.name,
			subject: dto.subject,
			template: dto.template,
		});
	}

	async deleteEmailTemplate(templateId: number) {
		await this.emailTemplateRepository.delete({ id: templateId });
	}

	async sendEmailConfirmCode(email: string): Promise<{ message: string }> {
		const user = await this.usersRepository.findOne({
			where: { email },
			select: {
				id: true,
				email: true,
				emailConfirmCode: true,
				username: true,
				surname: true,
			},
		});
		if (!user) {
			throw new BadRequestException(ErrorMessages.user.USER_NOT_FOUND);
		}

		if (user.isEmailConfirmed) {
			throw new BadRequestException(
				ErrorMessages.email.EMAIL_ALREADY_CONFIRMED
			);
		}

		user.emailConfirmCode = this.generateSixDigitNumber();

		await this.usersRepository.save(user);

		await this.emailService.sendEmailByTemplate(
			EmailTemplate.EmailConfirmCode,
			{
				username: user.username,
				emailConfirmCode: user.emailConfirmCode,
				email: user.email,
				date: new Date().getFullYear(),
			}
		);

		return { message: 'Email sended' };
	}

	generateSixDigitNumber() {
		const characters = '1234567890';
		let randomNumber = '';

		for (let i = 0; i < 6; i++) {
			const randomIndex = Math.floor(Math.random() * characters.length);
			const randomChar = characters.charAt(randomIndex);
			randomNumber += randomChar;
		}

		return randomNumber;
	}

	async confirmEmail(code: string, email: string): Promise<UserWithJwtDto> {
		const user = await this.usersRepository.findOne({
			where: { email },
			select: {
				id: true,
				email: true,
				emailConfirmCode: true,
				isEmailConfirmed: true,
			},
		});

		if (!user) {
			throw new BadRequestException(ErrorMessages.user.USER_NOT_FOUND);
		}

		if (user.isEmailConfirmed) {
			throw new BadRequestException(
				ErrorMessages.email.EMAIL_ALREADY_CONFIRMED
			);
		}

		if (user.emailConfirmCode === code) {
			await this.usersRepository.update(
				{ email },
				{ isEmailConfirmed: true, emailConfirmCode: null }
			);

			const publicUser = await this.usersRepository.findOne({
				where: { email },
				relations: ['role'],
			});
			const token = await this.tokenService.generateJwtToken(publicUser);
			return { user: publicUser, token };
		}

		throw new BadRequestException(
			ErrorMessages.email.CONFIRM_EMAIL_WITH_CODE_FAILED
		);
	}
}
