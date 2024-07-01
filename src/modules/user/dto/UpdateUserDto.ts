import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateUserDto {
	@ApiProperty({
		type: String,
		example: 'username',
	})
	@IsString()
	@IsOptional()
	username: string;

	@ApiProperty({
		type: String,
		example: 'surname',
	})
	@IsString()
	@IsOptional()
	surname: string;

	@ApiProperty({
		type: String,
		example: 'password',
	})
	@IsString()
	@IsOptional()
	password: string;
}
