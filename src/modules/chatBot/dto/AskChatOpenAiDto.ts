import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class AskChatOpenAiDto {
	@ApiProperty({
		type: String,
		description: 'Question for gptChat',
		example: 'coderfy is a platform for developers?',
	})
	@IsOptional()
	@IsString()
	prompt: string;

	@ApiProperty({
		type: String,
		description: 'name of chatbot',
		example: 'exemple_com',
	})
	@IsOptional()
	@IsString()
	type: string;

	@IsOptional()
	@IsBoolean()
	references: boolean;
}
