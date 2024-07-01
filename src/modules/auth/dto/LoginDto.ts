import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
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
		example: 'password',
	})
	@IsString()
	password: string;
}
