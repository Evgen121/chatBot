import { ApiProperty } from '@nestjs/swagger';

export class UpdatePromoCodeDto {
	@ApiProperty({
		example: 10,
		description: 'The new discount amount for the PromoCode.',
	})
	discount: number;

	@ApiProperty({
		example: 'c936f092-eed9-408a-a9a0-b728f2b9a65f',
		description: 'Thehe PromoCode.',
	})
	promoCode: string;
}
