import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ForgotPasswordDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'email@email.com',
	})
	@IsString()
	email: string;

	@ApiProperty({
		type: String,
		required: true,
		example: 'https://www.google.com',
	})
	@IsString()
	domain?: string;
}
