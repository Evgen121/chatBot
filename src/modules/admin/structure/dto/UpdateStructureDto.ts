import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateStructureDto {
	@ApiProperty({
		type: String,
		description: 'Structure name',
		example: 'retro',
	})
	@IsString()
	@IsOptional()
	name: string;

	@ApiProperty({
		type: String,
		description: 'Image URL',
		example: 'https://example.com/image.png',
	})
	@IsString()
	@IsOptional()
	imageUrl: string;
}
