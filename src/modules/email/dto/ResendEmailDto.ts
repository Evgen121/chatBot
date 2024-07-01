import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ResendEmailDto {
	@ApiProperty({
		example: 'email@email.com',
		description: 'Email to resend code',
	})
	@IsString()
	email: string;
}
