import { PromoCode } from '@/src/db/entities';
import { PromoCodeDto } from './promoCodeDto';
import { ApiProperty } from '@nestjs/swagger';

export class PromocodeResponseDto {
	constructor(data: PromoCode[], total: number) {
		this.data = data.map((promocode) => new PromoCodeDto(promocode));
		this.total = total;
	}

	@ApiProperty({
		type: [PromoCodeDto],
		description: 'List of promocode ',
	})
	data: PromoCodeDto[];

	@ApiProperty({
		type: Number,
		description: 'Total number of  promocode',
	})
	total: number;
}
