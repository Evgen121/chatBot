import { ApiProperty } from '@nestjs/swagger';

export class PromocodeDto {
	@ApiProperty({
		description: 'The promo code to be used',
		example: 'ABC123',
	})
	promoCode: string;
}
