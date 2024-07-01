import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStructureDto {
	@ApiProperty({
		type: String,
		description: 'Structure name',
		example: 'retro',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		type: String,
		description: 'Image URL',
		example: 'https://example.com/image.png',
	})
	@IsString()
	@IsOptional()
	imageUrl: string;

	stylCss: number;
}
