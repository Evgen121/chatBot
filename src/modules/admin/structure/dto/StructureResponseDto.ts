import { ApiProperty } from '@nestjs/swagger';
import { StructureEntity } from '@db/entities';
import { StructureDto } from './StructureDto';

export class StructureResponseDto {
	constructor(data: StructureEntity[], total: number) {
		this.data = data.map((sturcture) => new StructureDto(sturcture));
		this.total = total;
	}

	@ApiProperty({
		type: [StructureDto],
		description: 'List of structure ',
	})
	data: StructureDto[];

	@ApiProperty({
		type: Number,
		description: 'Total number of  structure',
	})
	total: number;
}
