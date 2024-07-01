import { ApiProperty } from '@nestjs/swagger';

export class ContentResponseDto {
	@ApiProperty({
		type: String,
		description: 'The unique identifier of the content entity',
		example: '9330b14c-8b23-4d64-a930-f97a0256a96d',
	})
	id: string;

	@ApiProperty({
		type: String,
		description: 'Keywords used for the content',
		example: 'SpaceX, Tesla',
	})
	keywords: string;

	@ApiProperty({
		type: String,
		description: 'Type of the content',
		example: 'instagram post',
	})
	textType: string;

	@ApiProperty({
		type: Number,
		description: 'Size of the content in tokens',
		example: 20,
	})
	size: number;

	@ApiProperty({
		type: String,
		description: 'Topic of the content',
		example: 'My work',
	})
	topic: string;

	@ApiProperty({
		type: String,
		description: 'Text of the content',
		example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
	})
	text: string;

	constructor(
		id: string,
		keywords: string,
		textType: string,
		size: number,
		topic: string,
		text: string
	) {
		this.id = id;
		this.keywords = keywords;
		this.textType = textType;
		this.size = size;
		this.topic = topic;
		this.text = text;
	}
}
