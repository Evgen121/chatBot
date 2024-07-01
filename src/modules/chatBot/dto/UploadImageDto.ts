import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadImageDto {
	@ApiProperty({
		type: String,
		description: 'Downoload Image for chatbot',
		example: 'file',
	})
	@IsString()
	@IsOptional()
	image: string;
}
