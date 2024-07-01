import { ApiProperty } from '@nestjs/swagger';

export class CreateContentResponseDto {
	@ApiProperty({
		type: String,
		description: 'The unique identifier of the content entity',
		example: '9330b14c-8b23-4d64-a930-f97a0256a96d',
	})
	id: string;

	@ApiProperty({
		type: String,
		description: 'Keywords used for the content',
		example: 'War in Ukraine',
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
		example: 200,
	})
	size: number;

	@ApiProperty({
		type: String,
		description: 'Topic of the content',
		example: 'UKRAIN',
	})
	topic: string;

	@ApiProperty({
		type: String,
		description: 'Creation date of the content',
		example: '2023-11-28T14:52:48.499Z',
	})
	creationDate: string;

	@ApiProperty({
		type: String,
		description: 'The content text',
		example: '"War in Ukraine- A call for peace and hope!" ...',
	})
	text: string;

	@ApiProperty({
		type: String,
		nullable: true,
		description: 'URL of the image associated with the content',
		example: null,
	})
	image: string | null;

	@ApiProperty({
		type: [String],
		description: 'Optional titles associated with the content',
		example: [],
	})
	optionalTitles: string[];

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
