import { EmailTemplateEntity } from '@db/entities';
import { EmailTemplateDto } from './EmailTemplateDto';
import { ApiProperty } from '@nestjs/swagger';

export class EmailTemplateResponseDto {
	constructor(emailTemplates: EmailTemplateEntity[], count: number) {
		this.data = emailTemplates.map(
			(emailTemplate) => new EmailTemplateDto(emailTemplate)
		);
		this.count = count;
	}

	@ApiProperty({
		type: [EmailTemplateDto],
	})
	data: EmailTemplateDto[];

	@ApiProperty({
		type: Number,
		example: 5,
	})
	count: number;
}
