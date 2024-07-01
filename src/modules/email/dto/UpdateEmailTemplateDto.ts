import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEmailTemplateDto {
	@ApiProperty({
		description: 'Name of the email template',
		example: 'New Chatbot',
	})
	@IsString()
	@IsOptional()
	name: string;

	@ApiProperty({
		description: 'Subject of the email',
		example: 'Subscription update',
	})
	@IsString()
	@IsOptional()
	subject: string;

	@ApiProperty({
		description: 'Email template in HTML or plain text',
	})
	@IsString()
	@IsOptional()
	template: string;
}
