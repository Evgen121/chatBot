import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckPasswordDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'password',
	})
	@IsString()
	password: string;
}
