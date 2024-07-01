import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '@modules/user/dto/CreateUserDto';
import { CheckPasswordResponseDto } from '../dto/CheckPasswordResponseDto';
import { LoginDto } from '../dto/LoginDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
import { CheckPasswordDto } from '../dto/CheckPasswordDto';
import { ErrorMessages } from '@utils/errors/errors';
import * as bcrypt from 'bcrypt';
import { TokenService } from '@shared/services/token.service';
import { v4 as uuidv4 } from 'uuid';
import { SendEmailService } from '@modules/email/sendEmail.service';
import { UserService } from '@modules/user/user.service';
import { LeadsEntity, UserEntity } from '@db/entities';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatBotService } from '@modules/chatBot/services/chatBot.service';
import { EmailTemplate } from '@modules/email/emailTemplate.enum';
import { UserDto } from '@modules/user/dto/UserDto';
import { EmailService } from '../../email/email.service';

@Injectable()
export class AuthService {
	constructor(
		private readonly userService: UserService,
		private readonly tokenService: TokenService,
		private readonly emailService: SendEmailService,
		private readonly emailLeadService: EmailService,
		private readonly chatBotService: ChatBotService,

		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		@InjectRepository(LeadsEntity)
		private readonly leadsRepository: Repository<LeadsEntity>
	) {}

	async registerUser(dto: CreateUserDto): Promise<UserDto> {
		const user = await this.userService.createUser(dto);

		const lead = await this.leadsRepository.findOne({
			where: { email: dto.email },
		});
		if (lead) {
			await this.chatBotService.updateUserChatbotsFromLead(lead, user.id);
		}
		return user;
	}
	async registerLead(): Promise<any> {
		const leads = await this.leadsRepository.find();
		const registeredUsers: UserDto[] = [];

		for (const lead of leads) {
			if (lead.email) {
				const existUser = await this.usersRepository.findOne({
					where: { email: lead.email },
				});

				if (existUser) {
					throw new ConflictException(ErrorMessages.user.USER_EXIST);
				}
				const leadDto: CreateUserDto = {
					username: lead.firstName,
					surname: lead.lastName,
					email: lead.email,
					password: this.generateRandomPassword(8),
					salt: '',
					emailConfirmCode: '',
				};
				const newUser = await this.userService.createUser(leadDto);
				const testUser = await this.usersRepository.findOne({
					where: {
						id: newUser.id,
					},
				});
				testUser.lastLoginDate = new Date();
				await this.usersRepository.save(testUser);

				const instructionUrl = await this.chatBotService.generatePdfInstruction(
					newUser.id
				);
				const email = newUser.email;
				const emailLanguage = lead.language || 'en';
				const emailTemplate =
					emailLanguage === 'ua'
						? EmailTemplate.Hello_UA
						: EmailTemplate.Hello_EN;
				await this.emailService.sendEmailByTemplate(emailTemplate, {
					email,
					linkToInstruction: instructionUrl,
				});

				await this.emailLeadService.sendEmailConfirmCode(leadDto.email);

				registeredUsers.push(newUser);
			}
		}

		return registeredUsers;
	}

	generateRandomPassword(length: number): string {
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';

		let password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset.charAt(randomIndex);
		}

		return password;
	}

	async loginUser(dto: LoginDto) {
		const existUser = await this.usersRepository.findOne({
			where: { email: dto.email },
			select: {
				id: true,
				email: true,
				username: true,
				password: true,
				salt: true,
				isBlocked: true,
				isEmailConfirmed: true,
				firstVisit: true,
			},
		});
		if (!existUser) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_EXISTS);
		}

		const validatePassword = await bcrypt.compare(
			dto.password + existUser.salt,
			existUser.password
		);

		if (!validatePassword) {
			throw new BadRequestException(ErrorMessages.user.WRONG_DATA);
		}

		if (existUser.isBlocked) {
			throw new ForbiddenException(ErrorMessages.user.USER_BLOCKED);
		}

		existUser.firstVisit = true;
		await this.usersRepository.save(existUser);
		const user = await this.userService.publicUser(dto.email);

		return user;
	}

	async requestReset(email: string, domain: string): Promise<void> {
		const user = await this.usersRepository.findOne({
			where: { email },
		});

		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
		const resetToken = uuidv4();

		await this.usersRepository.update({ email }, { resetToken });
		await this.sendResetEmail(email, resetToken, domain);
	}

	async sendResetEmail(
		email: string,
		token: string,
		domain: string
	): Promise<void> {
		const user = await this.userService.publicUser(email);
		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
		const resetUrl = `${domain}/reset-password?email=${email}&token=${token}`;
		await this.emailService.sendEmailByTemplate(EmailTemplate.PasswordReset, {
			email,
			username: user.username,
			resetUrl,
		});
	}

	async checkPassword(
		email: string,
		dto: CheckPasswordDto
	): Promise<CheckPasswordResponseDto> {
		const user = await this.usersRepository.findOne({
			where: { email },
			select: ['password', 'salt'],
		});

		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		const validatePassword = await bcrypt.compare(
			dto.password + user.salt,
			user.password
		);

		return { success: validatePassword };
	}

	async resetPassword(
		email: string,
		token: string,
		password: string
	): Promise<void> {
		const user = await this.usersRepository.findOne({ where: { email } });

		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		if (user.resetToken !== token) {
			throw new BadRequestException(ErrorMessages.user.INVALID_TOKEN);
		}
		await this.usersRepository.update({ email: email }, { resetToken: null });
		await this.userService.updatePassword(user.email, password);
	}

	async refreshToken(token: string): Promise<RefreshTokenDto> {
		return await this.tokenService.refreshToken(token);
	}
}
