import { ChatBotEntity, LeadsEntity } from '@/src/db/entities';
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

	lastLoginDate?: Date;

	chatBots?: ChatBotEntity[];

	lead?: LeadsEntity;

	isEmailConfirmed?: boolean;

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
