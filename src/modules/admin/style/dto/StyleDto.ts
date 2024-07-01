import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUrl } from 'class-validator';
import { CssStyleEntity } from '@db/entities';

export class StyleDto {
	constructor(style: CssStyleEntity) {
		this.id = style.id;
		this.name = style.name;
		this.cssName = style.cssName;
		this.imageUrl = style.imageUrl;
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
		description: 'Name',
		example: 'Retro',
	})
	name: string;

	@ApiProperty({
		type: String,
		description: 'Style name',
		example: 'modernRetro',
	})
	cssName: string;

	@ApiProperty({
		type: String,
		description: 'Chat bot image',
		example: 'https://example.com/image.png',
	})
	@IsUrl()
	@IsNotEmpty()
	imageUrl: string;

	@ApiProperty({
		type: String,
		description: 'Css properties',
		example: 'position:fixed, bottom: 10px,right: 10px, border-radius: 23p',
	})
	properties: string;
}
