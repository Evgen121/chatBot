import { ChatBotEntity } from '@/src/db/entities';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsBoolean,
	IsDate,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

export class ChatBotDto {
	constructor(chatbot: ChatBotEntity) {
		this.id = chatbot.id;
		this.name = chatbot.name;
		this.tone = chatbot.tone;
		this.style = chatbot.style;
		this.domain = chatbot.domain;
		this.imageUrl = chatbot.imageUrl;
		this.button = chatbot.button;
		this.askMe = chatbot.askMe;
		this.chatBotName = chatbot.chatBotName;
		this.max = chatbot.max;
		this.autocrawl = chatbot.autocrawl;
		this.model = chatbot.model;
		this.isActive = chatbot.isActive;
		this.expiryDate = chatbot.expiryDate;
		this.footer = chatbot.footer;
		this.styleCss = chatbot?.styleCss?.id;
		this.script = chatbot?.script?.id;
		this.structure = chatbot?.structure?.id;
	}

	@ApiProperty({
		type: Number,
		description: 'ID',
		example: 1,
	})
	@IsNumber()
	@IsOptional()
	id: number;

	@ApiProperty({
		type: String,
		description: 'name of the chatbot',
	})
	@IsString()
	@IsOptional()
	name: string;
	@ApiProperty({
		type: String,
		description: 'Tone',
		example: 'friendly',
	})
	@IsString()
	@IsOptional()
	tone: string;

	@ApiProperty({
		type: String,
		description: 'Style',
		example: 'modern',
	})
	@IsString()
	@IsOptional()
	style: string;

	@ApiProperty({
		type: String,
		description: 'Domain',
		example: 'ecommerce',
	})
	@IsString()
	domain: string;

	@ApiProperty({
		type: String,
		description: 'Image URL',
		example: 'https://example.com/image.png',
	})
	@IsString()
	@IsOptional()
	imageUrl: string;

	@ApiProperty({
		type: String,
		description: 'Button',
		example: 'Click here',
	})
	@IsString()
	@IsOptional()
	button: string;

	@ApiProperty({
		type: String,
		description: 'Ask Me',
		example: 'Any questions?',
	})
	@IsString()
	@IsOptional()
	askMe: string;

	@ApiProperty({
		type: String,
		description: 'Chat Bot Name',
		example: 'MyChatBot',
	})
	@IsString()
	@IsOptional()
	chatBotName: string;

	@ApiProperty({
		type: Number,
		description: 'Maximum number of page crawl',
		example: 100,
	})
	@IsNumber()
	@IsOptional()
	max: number;

	@ApiProperty({
		type: Boolean,
		description: 'Auto crawl your website  ',
		example: true,
	})
	@IsBoolean()
	@IsOptional()
	autocrawl: boolean;

	@ApiProperty({
		type: String,
		description: 'Model gptchat',
		example: 'gpt-3.5-turbo',
	})
	@IsString()
	@IsOptional()
	model: string;

	@ApiProperty({
		type: String,
		description: 'Recaptcha key',
		example: 'awdsfasndjfjasdnfkasdnvkwjorenavdsv',
	})
	@IsString()
	@IsOptional()
	recaptchaKey: string;

	@ApiProperty({
		type: String,
		description: 'Recaptcha secret key',
		example: 'awdsfasndjfjasdnfkasdnvkwjorenavdsv',
	})
	@IsString()
	@IsOptional()
	recaptchaSecret: string;

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
		description: 'Style name id (Ocean, Dark)',
		example: 'id:1',
	})
	styleCss: number;

	@ApiProperty({
		description: 'JavaScript id',
		example: 'id:1',
	})
	script: number;

	@ApiProperty({
		description: 'Structure style id (modern, retro, icon)',
		example: 'id:1',
	})
	structure: number;
}
