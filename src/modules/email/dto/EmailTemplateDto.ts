import { ApiProperty } from '@nestjs/swagger';
import { EmailTemplateEntity } from '@db/entities/emailTemplate.entity';

export class EmailTemplateDto {
	constructor(emailTemplate: EmailTemplateEntity) {
		this.id = emailTemplate.id;
		this.name = emailTemplate.name;
		this.subject = emailTemplate.subject;
		this.template = emailTemplate.template;
	}
	@ApiProperty({
		type: Number,
		example: 2,
	})
	id: number;

	@ApiProperty({
		type: String,
		description: 'Name of the template',
	})
	name: string;

	@ApiProperty({
		description: 'Subject of the email',
		example: 'Subscription update',
	})
	subject: string;

	@ApiProperty({
		type: String,
		description: 'Html or plain text template',
	})
	template: string;
}
