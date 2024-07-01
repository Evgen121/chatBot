import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class StatusChatBotDto {
	@ApiProperty({
		type: String,
		description: 'name of chatbot',
		example: 'exemple_com',
	})
	@IsOptional()
	@IsString()
	type: string;
}
