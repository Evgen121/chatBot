import { ApiProperty } from '@nestjs/swagger';

export class UpdateStyleDto {
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
		description: 'Css properties',
		example: 'position:fixed, bottom: 10px,right: 10px, border-radius: 23p',
	})
	properties: string;
}
