import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateHtmlContentDto {
	@ApiProperty({
		description:
			'Styling framework to use. I recommend to use something like tailwind because it takes less tokens. On the frontend you can add the framework via CDN or something like that',
		type: String,
		example: 'tailwind',
	})
	@IsString()
	stylingFramework: string;

	@ApiProperty({
		description:
			'Describe how you see this web page. You can also describe fonts, colors, etc. This is an optional field.',
		type: String,
		example:
			'I want the web page to look like a webpage from early 2010s. The font should be Comic Sans.',
		nullable: true,
	})
	@IsString()
	@IsOptional()
	stylingDescription: string;

	@ApiProperty({
		description: 'Weather to add images or not',
		type: Boolean,
		example: true,
	})
	@IsBoolean()
	addImages: boolean;

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

	subject: string;
}
