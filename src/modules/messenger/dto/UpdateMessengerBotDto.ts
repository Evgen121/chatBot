import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateMessengerBotDto {
	@ApiProperty({
		description: 'Token you get from https://t.me/BotFather',
		type: String,
		example: '1234567890:AzfdG34Ix34Ko36a2xpYpZfDjUrt_4SrfiasfU-o',
	})
	@IsString()
	@IsOptional()
	botToken: string;

	@ApiProperty({
		description: 'telegram | viber | whatsup | messenger',
		type: String,
		enum: ['telegram', 'viber', 'whatsup', 'messenger'],
		example: 'telegram | viber | whatsapp | messenger',
	})
	@IsOptional()
	@IsString()
	@IsIn(['telegram', 'viber', 'whatsup', 'messenger'], {
		message:
			'Invalid messenger value. Allowed values: telegram, viber, whatsapp, messenger',
	})
	messenger: string;

	@ApiProperty({
		description: 'Id of chatBot you want to speak to in telegram',
		type: Number,
		example: 4,
	})
	@IsNumber()
	@IsOptional()
	chatbotId: number;
}
