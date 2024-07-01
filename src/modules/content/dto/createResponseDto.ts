import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateContentResponseDto {
	@ApiProperty({
		type: String,
		required: true,
		example: '5269a17d-fce1-4764-b91c-0a6855057373',
	})
	@IsString()
	id: string;

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
	@IsString()
	optionalTitles: string;

	@ApiProperty({
		type: [String],
		required: false,
		example: ['Food'],
	})
	@IsString()
	subject: string;

	@ApiProperty({
		type: Number,
		required: true,
		example: 20,
	})
	@IsInt()
	size: number;

	@ApiProperty({
		type: Date,
		required: true,
		example: '2021-03-01T00:00:00.000Z',
	})
	createdAt: Date;

	@ApiProperty({
		type: String,
		required: true,
		example:
			'The sun sets, painting the sky in hues of orange and pink. Waves gently kiss the shore, creating a serene scene',
	})
	@IsString()
	text: string;
}
