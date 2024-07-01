import { ApiProperty } from '@nestjs/swagger';
import { ScriptEntity } from '@db/entities';
import { ScriptDto } from './ScriptDto';

export class ScriptResponseDto {
	constructor(data: ScriptEntity[], total: number) {
		this.data = data.map((script) => new ScriptDto(script));
		this.total = total;
	}

	@ApiProperty({
		type: [ScriptDto],
		description: 'List of javascript ',
	})
	data: ScriptDto[];

	@ApiProperty({
		type: Number,
		description: 'Total number of  javascript',
	})
	total: number;
}
