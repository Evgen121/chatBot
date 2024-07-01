import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStyleDto {
	@ApiProperty({
		type: String,
		description: 'Name',
		example: 'Retro',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		type: String,
		description: 'Style name',
		example: 'modernRetro',
	})
	@IsString()
	@IsNotEmpty()
	cssName: string;

	@ApiProperty({
		type: String,
		description: 'Css properties',
		example: 'position:fixed, bottom: 10px,right: 10px, border-radius: 23p ...',
	})
	@IsString()
	@IsNotEmpty()
	properties: string;
}
