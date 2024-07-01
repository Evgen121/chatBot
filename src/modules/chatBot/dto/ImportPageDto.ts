import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

export class ImportPageDto {
	@ApiProperty({
		type: Number,
		description: 'Minimum character count for completions',
		example: '50',
	})
	@IsNumber()
	threshold: number;

	@ApiProperty({
		type: Number,
		description: 'Delay in milliseconds between pages',
		example: 2000,
	})
	@IsNumber()
	delay: number;

	@ApiProperty({
		type: Number,
		description: 'Maximum number of page crawl',
		example: 100,
	})
	@IsNumber()
	max: number;

	@ApiProperty({
		type: Boolean,
		description:
			'Summarize training snippets that are too long to be effectively used',
		example: true,
	})
	@IsBoolean()
	summarize: boolean;

	@ApiProperty({
		type: Number,
		description: 'id of chatbot',
		example: 3,
	})
	@IsNumber()
	id: number;

	@ApiProperty({
		type: String,
		description: 'Url page for scraping',
		example: 'https://www.example.com/',
	})
	@IsString()
	url: string;
}
