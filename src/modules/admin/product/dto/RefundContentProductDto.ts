import { ApiProperty } from '@nestjs/swagger';

export class RefundContentProductDto {
	@ApiProperty({
		type: Number,
		description: 'user id',
		example: 1,
	})
	userId: number;

	@ApiProperty({
		type: Number,
		description: 'product id',
		example: 1,
	})
	productId: number;
}
