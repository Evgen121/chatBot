import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class createWithSubjectContentDto {
	@ApiProperty({
		type: String,
		required: true,
		example: 'SpaceX, Tesla',
	})
	@IsString()
	keywords: string;

	@ApiProperty({
		type: String,
		required: true,
		example: 'Elon Musk',
	})
	@IsString()
	topic: string;

	@ApiProperty({
		type: String,
		required: true,
		example: 'instagram post',
	})
	@IsString()
	textType: string;

	@ApiProperty({
		type: [String],
		required: false,
		example: ['FAQ'],
	})
	@IsString({ each: true })
	optionalTitles: string[];

	@ApiProperty({
		type: Number,
		required: true,
		example: 20,
		description: 'Size in tokens. 1 token is around 4 characters.',
	})
	@IsInt()
	size: number;

	@ApiProperty({
		type: String,
		required: true,
		example: 'My work',
	})
	@IsString()
	subject: string;

	@ApiProperty({
		type: Boolean,
		required: false,
		example: true,
		description: 'Flag to indicate whether to generate an image.',
	})
	@IsBoolean()
	images?: boolean;

	@ApiProperty({
		type: Number,
		required: false,
		example: 5,
		description: 'Number of images.',
	})
	@IsOptional()
	@IsInt()
	quantityImage?: number;
}
