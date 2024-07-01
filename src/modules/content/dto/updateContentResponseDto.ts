import { ApiProperty } from '@nestjs/swagger';

export class UpdatedContentResponseDto {
	@ApiProperty({
		type: String,
		description: 'The unique identifier of the updated content entity',
		example: 'some-uuid-here',
	})
	id: string;

	@ApiProperty({
		type: String,
		description: 'Updated keywords for the content',
		example: 'SpaceX, Tesla',
	})
	keywords: string;

	@ApiProperty({
		type: String,
		description: 'Updated type of the content',
		example: 'instagram post',
	})
	textType: string;

	@ApiProperty({
		type: Number,
		description: 'Updated size of the content in tokens',
		example: 20,
	})
	size: number;

	@ApiProperty({
		type: String,
		description: 'Updated topic of the content',
		example: 'My work',
	})
	topic: string;

	@ApiProperty({
		type: String,
		description: 'Updated text of the content',
		example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
	})
	text: string;

	@ApiProperty({
		type: String,
		nullable: true,
		description: 'Updated URL of the image associated with the content',
		example: null,
	})
	image: string | null;

	@ApiProperty({
		type: [String],
		description: 'Updated optional titles associated with the content',
		example: [],
	})
	optionalTitles: string[];
}
