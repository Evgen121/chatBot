import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsString } from 'class-validator';

export class AnswerChatOpenAiDto {
	@ApiProperty({
		type: String,
		description: 'prompt response',
		example: 'coderfy is a platform for developers',
	})
	@IsString()
	result: string;

	@ApiProperty({
		type: Array,
		description: 'array link answer ',
		example:
			'{prompt: "Who created this ChatGPT website chatbot?" uri: "https://www.coderfy.com}"',
	})
	@IsArray()
	references: string[];

	@ApiProperty({
		type: String,
		description: 'finish resone',
		example: 'stop or error',
	})
	@IsString()
	finish_reason: string;

	@ApiProperty({
		type: String,
		description: 'time for answer',
		example: '05.743',
	})
	@IsNumber()
	db_time: number;
}
