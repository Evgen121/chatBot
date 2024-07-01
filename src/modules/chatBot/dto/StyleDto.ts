import { ApiProperty } from '@nestjs/swagger';
import { CssStyleEntity } from '@db/entities';
import { StructureDto } from '@modules/admin/structure/dto/StructureDto';

export class StyleDto {
	constructor(style: CssStyleEntity) {
		this.id = style.id;
		this.name = style.name;
		this.properties = style.properties;
	}

	@ApiProperty({
		type: Number,
		description: 'Style id',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		description: 'Style name',
		example: 'Retro',
	})
	name: string;

	@ApiProperty({
		type: String,
		description: 'Css properties',
		example: 'position:fixed, bottom: 10px,right: 10px, border-radius: 23p',
	})
	properties: string;

	structure: StructureDto;
}
