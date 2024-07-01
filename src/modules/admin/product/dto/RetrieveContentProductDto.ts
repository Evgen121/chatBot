import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class RetrieveContentProductDto {
	@ApiProperty({
		type: Number,
		description: 'Product id that will be retrieved by user',
	})
	@IsNumber()
	productId: number;

	@ApiProperty({
		type: Number,
		description: 'User id that will retrieve the product',
	})
	@IsNumber()
	userId: number;
}
