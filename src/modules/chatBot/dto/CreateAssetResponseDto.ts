import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateAssetResponseDto {
	@ApiProperty()
	@IsString()
	tone: string;

	@ApiProperty()
	@IsString()
	style: string;

	@ApiProperty()
	@IsString()
	domain: string;

	@ApiProperty()
	@IsString()
	name: string;

	@ApiProperty()
	@IsString()
	button: string;

	@ApiProperty()
	@IsString()
	askMe: string;
}
