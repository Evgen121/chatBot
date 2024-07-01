import {
	Controller,
	Post,
	Get,
	Body,
	Req,
	Res,
	UseGuards,
	Query,
	Param,
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { CreateUserDto } from '../user/dto/CreateUserDto';
import { UserWithJwtDto } from '../user/dto/UserWithJwtDto';
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { OAuth2Client } from 'google-auth-library';
import { CheckPasswordResponseDto } from './dto/CheckPasswordResponseDto';
import { LoginDto } from './dto/LoginDto';
import { RestPasswordDto } from './dto/ResetPasswordDto';
import { RefreshTokenDto } from './dto/RefreshTokenDto';
import { ForgotPasswordDto } from './dto/ForgotPasswordDto';
import { CheckPasswordDto } from './dto/CheckPasswordDto';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { GoogleAuthService } from './services/googleAuth.service';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { GitHubAuthService } from './services/githubAuth.service';
import { FacebookAuthService } from './services/facebookAuth.service';
import { GoogleAuthDto } from './dto/GoogleAuthDto';
import { EmailService } from '../email/email.service';
import { TokenService } from '@shared/services/token.service';
import { UserDto } from '../user/dto/UserDto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
	private readonly client: OAuth2Client;

	constructor(
		private readonly authService: AuthService,
		private readonly googleAuthService: GoogleAuthService,
		private readonly githubAuthService: GitHubAuthService,
		private readonly facebookAuthService: FacebookAuthService,
		private readonly emailService: EmailService,
		private readonly tokenService: TokenService
	) {
		this.client = new OAuth2Client(
			process.env.GOOGLE_AUTH_CLIENT_ID,
			process.env.GOOGLE_AUTH_CLIENT_SECRET
		);
	}

	@ApiResponse({ status: 201, type: CreateUserDto })
	@Post('register')
	async register(@Body() dto: CreateUserDto): Promise<UserDto> {
		const user = await this.authService.registerUser(dto);
		await this.emailService.sendEmailConfirmCode(dto.email);
		return user;
	}

	@ApiResponse({ status: 200, type: UserWithJwtDto })
	@Post('login')
	async login(@Body() dto: LoginDto): Promise<UserWithJwtDto> {
		const user = await this.authService.loginUser(dto);
		if (!user.isEmailConfirmed) {
			await this.emailService.sendEmailConfirmCode(dto.email);
			return { user, token: null };
		}
		const token = await this.tokenService.generateJwtToken(user);
		return new UserWithJwtDto(user, token);
	}

	@ApiResponse({ status: 200, description: SwaggerComments.IS_TOKEN_VALID })
	@UseGuards(JwtAuthGuard)
	@Get('isTokenValid')
	isTokenValid() {
		return { isValid: true };
	}

	@ApiResponse({ status: 200, type: CheckPasswordResponseDto })
	@ApiBody({
		type: CheckPasswordDto,
		description: SwaggerComments.CHECK_PASSWORD,
	})
	@UseGuards(JwtAuthGuard)
	@Roles('admin', 'user')
	@Post('password/check')
	async checkPassword(
		@Req() req,
		@Body() dto: CheckPasswordDto
	): Promise<CheckPasswordResponseDto> {
		return await this.authService.checkPassword(req.user.email, dto);
	}

	@ApiResponse({
		status: 201,
		description: 'Password reset request successfully email sent.',
	})
	@ApiBody({
		type: ForgotPasswordDto,
		description: SwaggerComments.FORGOT_PASSWORD,
	})
	@Post('password/forgot')
	async requestReset(
		@Body('email') email: string,
		@Body('domain') domain: string
	): Promise<{ message: string }> {
		await this.authService.requestReset(email, domain);
		return { message: 'Password reset request successfully sent.' };
	}

	@ApiResponse({ status: 201, type: String })
	@ApiBody({
		type: RestPasswordDto,
		description: SwaggerComments.UPDATE_PASWORD,
	})
	@Post('password/reset')
	async resetPassword(
		@Body()
		{ email, resetToken, password }: RestPasswordDto
	): Promise<{ message: string }> {
		await this.authService.resetPassword(email, resetToken, password);
		return { message: 'Password reset successfully.' };
	}

	@ApiBody({
		description: SwaggerComments.GOOGLE_AUTH,
	})
	@Post('login/google')
	async googleAuth(@Body() body: GoogleAuthDto) {
		const { accessToken } = body;
		const ticket = await this.client.verifyIdToken({
			idToken: accessToken,
			audience: process.env.GOOGLE_AUTH_CLIENT_ID,
		});

		const payload = ticket.getPayload();

		return await this.googleAuthService.googleAuthLogin(payload);
	}

	@ApiBody({
		description: SwaggerComments.GOOGLE_AUTH_ACCESS_TOKEN,
		type: GoogleAuthDto,
	})
	@Post('login/google/access-token')
	async googleAuthAccessToken(@Body() dto: GoogleAuthDto) {
		return this.googleAuthService.getAccessToken(dto);
	}

	@ApiParam({
		name: 'type',
		enum: ['content', 'chatbot'],
		description: SwaggerComments.GITHUB_AUTH,
	})
	@Get('github/:type')
	async githubAuthContent(@Param('type') type: string, @Res() res: any) {
		const url = await this.githubAuthService.getRedirectUrl(type);
		res.redirect(url);
	}

	@ApiParam({
		name: 'type',
		enum: ['content', 'chatbot'],
		description: SwaggerComments.GITHUB_CALLBACK_AUTH,
	})
	@ApiQuery({
		name: 'code',
		description: SwaggerComments.GITHUB_CALLBACK_AUTH_CODE,
	})
	@Get('github/callback/:type')
	async githubAuthCallbackContent(
		@Param('type') type: string,
		@Query() query: any,
		@Res() res
	) {
		const url = await this.githubAuthService.getCallbackRedirectUrl(
			query,
			type
		);
		res.redirect(url);
	}

	@ApiQuery({
		name: 'source',
		enum: [
			'https://content-generator.coderfy.com',
			'https://chatbot-generator.coderfy.com',
		],
		description: SwaggerComments.FACEBOOK_SOURCE,
	})
	@Get('facebook')
	async facebookAuth(@Res() res: any, @Query() query: any) {
		const url = this.facebookAuthService.getRedirectUrl(query.source);
		res.redirect(url);
	}

	@ApiQuery({
		name: 'code',
		description: SwaggerComments.FACEBOOK_CALLBACK_AUTH_CODE,
	})
	@ApiQuery({
		name: 'state',
		description: SwaggerComments.FACEBOOK_CALLBACK_AUTH_STATE,
	})
	@Get('facebook/callback')
	async facebookAuthCallback(@Query() query: any, @Res() res) {
		const accessToken = await this.facebookAuthService.getAccessToken(
			query.code
		);
		const facebookUser = await this.facebookAuthService.getUserData(
			accessToken
		);
		const user = await this.facebookAuthService.getOrCreateUser(facebookUser);
		const redirectUrl = await this.facebookAuthService.getCallbackRedirectUrl(
			user,
			query.state
		);

		res.redirect(redirectUrl);
	}

	@ApiResponse({ status: 201, type: RefreshTokenDto })
	@ApiBody({
		type: RefreshTokenDto,
		description: SwaggerComments.REFRESH_TOKEN,
	})
	@Post('refresh-token')
	async refreshToken(@Body() data: RefreshTokenDto): Promise<RefreshTokenDto> {
		return await this.authService.refreshToken(data.token);
	}
}
