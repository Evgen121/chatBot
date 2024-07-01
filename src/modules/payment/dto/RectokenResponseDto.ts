import { RectokenEntity } from '@db/entities';
import { RectokenDto } from './RectokenDto';
import { ApiProperty } from '@nestjs/swagger';

export class RectokenResponseDto {
	constructor(rectokens: RectokenEntity[], count: number) {
		this.result = rectokens.map((rectoken) => new RectokenDto(rectoken));
		this.count = count;
	}

	@ApiProperty({
		type: [RectokenDto],
		description: 'List of rectokens',
	})
	result: RectokenDto[];

	@ApiProperty({
		type: Number,
		description: 'Total number of rectokens',
	})
	count: number;
}
