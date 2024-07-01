import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RestPasswordDto {
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

	@ApiProperty({
		type: String,
		required: true,
		example: '7b8e1803-fdd6-440b-96de-c36ce35edac7',
	})
	@IsString()
	resetToken: string;
}
