import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteConfigByTitleNameDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'SEO Description',
	})
	@IsString()
	titleName: string;
}
