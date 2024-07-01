import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateEmailTemplateDto {
	@ApiProperty({
		description: 'Name of the email template',
		example: 'New Chatbot',
	})
	@IsString()
	name: string;

	@ApiProperty({
		description: 'Subject of the email',
		example: 'Subscription update',
	})
	@IsString()
	subject: string;

	@ApiProperty({
		description: 'Email template in HTML or plain text',
	})
	@IsString()
	template: string;
}
