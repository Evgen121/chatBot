import { PromoCode } from '@/src/db/entities';
import { ApiProperty } from '@nestjs/swagger';

export class PromoCodeDto {
	constructor(promocode: PromoCode) {
		this.id = promocode.id;
		this.discount = promocode.discount;
		this.promoCode = promocode.promoCode;
	}

	@ApiProperty({
		type: Number,
		description: 'Promocode  id',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: Number,
		description: 'Promocode discount',
		example: 1,
	})
	discount: number;

	@ApiProperty({
		example: 'c936f092-eed9-408a-a9a0-b728f2b9a65f',
		description: 'Thehe PromoCode.',
	})
	promoCode: string;
}
