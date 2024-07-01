import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { SwaggerComments } from '@utils/swagger/swaggerComments';

export class CreateFeedbackDto {
	@ApiProperty({
		type: String,
		required: true,
		example: SwaggerComments.MESSAGE,
	})
	@IsString()
	message: string;

	@ApiProperty({
		type: String,
		required: true,
		example: SwaggerComments.SUBJECT,
	})
	@IsString()
	subject: string;

	@ApiProperty({
		type: String,
		required: false,
		example: SwaggerComments.EMAIL,
	})
	@IsOptional()
	@IsEmail()
	email: string;

	@ApiProperty({
		type: String,
		required: false,
		example: SwaggerComments.NAME,
	})
	@IsOptional()
	@IsEmail()
	name: string;
}
