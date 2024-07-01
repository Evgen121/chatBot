import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RetrieveChatbotProductDto {
	@ApiProperty({
		type: Number,
		description: 'ExpiryDate of the chatbot',
	})
	@IsNumber()
	periodEnd: number;

	@ApiProperty({
		type: String,
		description: 'Subscription id',
	})
	@IsString()
	subscriptionId: string;

	@ApiProperty({
		type: Number,
		description: 'User id where the expiry date will be updated',
	})
	@IsNumber()
	userId: number;
}
