import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ConfirmEmailDto {
	@ApiProperty({ example: 'kjb3k4', description: 'Code from email' })
	@IsString()
	code: string;

	@ApiProperty({ example: 'email@email.com', description: 'Email' })
	@IsString()
	email: string;
}
