import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'username',
	})
	@IsString()
	username: string;

	@ApiProperty({
		type: String,
		required: true,
		example: 'surname',
	})
	@IsString()
	surname: string;

	@ApiProperty({
		type: String,
		required: true,
		example: 'email',
	})
	@IsString()
	email: string;

	@IsString()
	@IsOptional()
	salt: string;

	@IsString()
	@IsOptional()
	emailConfirmCode: string;

	@ApiProperty({
		type: String,
		required: true,
		example: 'password',
	})
	@IsString()
	password: string;
}
