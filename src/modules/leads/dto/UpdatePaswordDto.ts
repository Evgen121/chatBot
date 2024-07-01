import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdatePasswordDto {
	@ApiProperty({
		type: String,
		required: true,
	})
	@IsString()
	password: string;

	@ApiProperty()
	@IsString()
	resetToken: string;
}
