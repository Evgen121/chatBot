import { ApiProperty } from '@nestjs/swagger';
import { CssStyleEntity } from '@db/entities';
import { StyleDto } from './StyleDto';

export class StyleResponseDto {
	constructor(data: CssStyleEntity[], total: number) {
		this.data = data.map((style) => new StyleDto(style));
		this.total = total;
	}

	@ApiProperty({
		type: [StyleDto],
		description: 'List of styles',
	})
	data: StyleDto[];

	@ApiProperty({
		type: Number,
		description: 'Total number of styles',
	})
	total: number;
}
