import { ApiProperty } from '@nestjs/swagger';

export class UpdateContentDto {
	@ApiProperty({
		type: String,
		required: false,
		example: 'SpaceX, Tesla',
	})
	keywords?: string;

	@ApiProperty({
		type: String,
		required: false,
		example: 'instagram post',
	})
	textType?: string;

	@ApiProperty({
		type: Number,
		required: false,
		example: 20,
		description: 'Size in tokens. 1 token is around 4 characters.',
	})
	size?: number;

	@ApiProperty({
		type: String,
		required: false,
		example: 'My work',
	})
	topic?: string;

	@ApiProperty({
		type: String,
		required: false,
		example: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
	})
	text?: string;

	@ApiProperty({
		type: String,
		required: false,
		example: null,
		description: 'Flag to indicate whether to update the image.',
	})
	image?: string | null;

	@ApiProperty({
		type: [String],
		required: false,
		example: ['Updated FAQ'],
	})
	optionalTitles?: string[];
}
