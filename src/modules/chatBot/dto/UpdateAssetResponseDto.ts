import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateAssetResponseDto {
	@ApiProperty()
	@IsString()
	chatBotName: string;

	@ApiProperty()
	@IsString()
	askMe: string;

	@ApiProperty()
	@IsString()
	button: string;

	@ApiProperty()
	@IsString()
	tone: string;

	@ApiProperty()
	@IsString()
	style: string;
}
