import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { StructureEntity } from '@db/entities';
import { StyleDto } from '@modules/chatBot/dto/StyleDto';

export class StructureDto {
	constructor(structure: StructureEntity) {
		this.id = structure.id;
		this.name = structure.name;
		this.styleCss = structure?.styleCss?.map((style) => new StyleDto(style));
	}

	@ApiProperty({
		type: Number,
		description: 'Structure id',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		description: 'Structure name',
		example: 'retro',
	})
	name: string;

	@ApiProperty({
		type: [StyleDto],
		description: 'Style name',
		example: 'Ocean',
	})
	@IsString()
	@IsOptional()
	styleCss: StyleDto[];

	@ApiProperty({
		type: String,
		description: 'Image URL',
		example: 'https://example.com/image.png',
	})
	@IsString()
	@IsOptional()
	imageUrl: string;
}
