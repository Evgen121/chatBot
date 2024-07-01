import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CheckPasswordResponseDto {
	@ApiProperty({
		type: Boolean,
		required: true,
		example: true,
	})
	@IsString()
	success: boolean;
}
