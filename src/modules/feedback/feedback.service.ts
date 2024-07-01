import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { ErrorMessages } from '@utils/errors/errors';
import { FeedbackEntity, UserEntity } from '@db/entities';
import { SendEmailService } from '../email/sendEmail.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFeedbackDto } from './dto/CreateFeedbackDto';
import { EmailTemplate } from '../email/emailTemplate.enum';

@Injectable()
export class FeedbackService {
	constructor(
		@InjectRepository(FeedbackEntity)
		private readonly feedbackRepository: Repository<FeedbackEntity>,
		private readonly emailService: SendEmailService,

		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>
	) {}

	async createFeedback(dto: CreateFeedbackDto) {
		try {
			await this.feedbackRepository.save({
				email: dto.email,
				message: dto.message,
				name: dto.name,
				subject: dto.subject,
			});
			this.sendFeedbackToAdmins(dto);
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.feedback.FEEDBACK_NOT_CREATED
			);
		}
	}

	async sendFeedbackToAdmins(dto: CreateFeedbackDto) {
		try {
			const admins = await this.usersRepository.find({
				where: { role: { id: 2 } },
			});
			for (const admin of admins) {
				await this.emailService.sendEmailByTemplate(EmailTemplate.NewFeedback, {
					email: admin.email,
					name: dto.name,
					userEmail: dto.email,
					message: dto.message,
				});

				await new Promise((resolve) => setTimeout(resolve, 10000));
			}
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.email.EMAIL_SEND_FAILED
			);
		}
	}

	async getAllFeedbacks() {
		try {
			return await this.feedbackRepository.find();
		} catch {
			throw new NotFoundException(ErrorMessages.feedback.NOT_FOUND);
		}
	}
}
