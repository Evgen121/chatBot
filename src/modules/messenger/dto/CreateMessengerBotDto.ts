import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNumber, IsString } from 'class-validator';

export class CreateMessengerBotDto {
	@ApiProperty({
		description:
			'Token you get from https://t.me/BotFather, https://partners.viber.com/account/create-bot-account or meta developers for messenger and whatsapp',
		type: String,
		example: '1234567890:AzfdG34Ix34Ko36a2xpYpZfDjUrt_4SrfiasfU-o',
	})
	@IsString()
	botToken: string;

	@ApiProperty({
		description: 'telegram | viber | whatsapp | messenger',
		type: String,
		enum: ['telegram', 'viber', 'whatsapp', 'messenger'],
		example: 'telegram | viber | whatsapp | messenger',
	})
	@IsString()
	@IsIn(['telegram', 'viber', 'whatsapp', 'messenger'], {
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
	chatbotId: number;
}
