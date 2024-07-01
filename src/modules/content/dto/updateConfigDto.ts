import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class UpdateContentConfigDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'SEO Description',
	})
	@IsString()
	titleName: string;

	@ApiProperty({
		type: Number,
		required: true,
		example: 40,
	})
	@IsInt()
	titleSize: number;
}
