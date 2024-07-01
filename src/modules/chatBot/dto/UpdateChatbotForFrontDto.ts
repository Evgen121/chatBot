import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateChatbotForFrontDTO {
	@ApiProperty({
		type: String,
		description: 'Chat Bot Name',
		example: 'MyChatBot',
	})
	@IsOptional()
	@IsString()
	chatBotName: string;

	@ApiProperty({
		type: String,
		description: 'Ask Me',
		example: 'Any questions?',
	})
	@IsOptional()
	@IsString()
	askMe: string;

	@ApiProperty({
		type: String,
		description: 'Button',
		example: 'Click here',
	})
	@IsOptional()
	@IsString()
	button: string;

	@ApiProperty({
		type: String,
		description: 'Tone',
		example: 'friendly',
	})
	@IsOptional()
	@IsString()
	tone: string;

	@ApiProperty({
		type: String,
		description: 'Style',
		example: 'modern',
	})
	@IsOptional()
	@IsString()
	style: string;

	@ApiProperty({
		type: Boolean,
		description: 'Is Active',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	isActive: boolean;

	@ApiProperty({
		type: Date,
		description: 'Expiry Date',
		example: '2023-08-31T00:00:00.000Z',
	})
	@IsOptional()
	@IsDate()
	expiryDate: Date;

	@ApiProperty({
		type: String,
		description: 'Footer',
		example: 'Copyright © 2023 MyChatBot Inc.',
	})
	@IsOptional()
	@IsString()
	footer: string;

	@ApiProperty({
		description: 'Style name id',
		example: '1',
	})
	@IsOptional()
	styleCss: number;

	@ApiProperty({
		type: Boolean,
		description: 'Answer in speech',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	speech: boolean;

	@ApiProperty({
		type: Boolean,
		description: 'Add reference to the answer',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	search: boolean;

	@ApiProperty({
		description: 'Structure id',
		example: '1',
	})
	@IsOptional()
	structure: number;
}
