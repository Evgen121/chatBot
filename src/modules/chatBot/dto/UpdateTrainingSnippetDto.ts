import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateTrainingSnippetDto {
	@ApiProperty({
		type: String,
		description: 'prompt response',
		example: 'coderfy is a platform for developers',
	})
	@IsOptional()
	@IsString()
	completion: string;

	@ApiProperty({
		type: String,
		description: 'prompt',
		example: 'coderfy is a platform for developers?',
	})
	@IsOptional()
	@IsString()
	prompt: string;

	@ApiProperty({
		type: Number,
		description: 'flag indicating whether the snippet is cached',
		example: 1,
	})
	@IsOptional()
	@IsNumber()
	cached: number | null;
}
