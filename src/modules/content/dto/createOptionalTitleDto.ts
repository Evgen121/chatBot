import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateOptionalTitleDto {
	@ApiProperty({
		type: 'string',
		description: 'Id that was returned when text was created',
		example: 'd727866d-0295-4a41-a15c-a52ad59c985e',
	})
	@IsString()
	contentID: string;

	@ApiProperty({
		type: 'string',
		description: 'Optional title for content',
		example: 'FAQ',
	})
	@IsString()
	optionalTitle: string;
}
