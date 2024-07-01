import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateSubjectContentDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'Economic',
	})
	@IsString()
	name: string;
}
