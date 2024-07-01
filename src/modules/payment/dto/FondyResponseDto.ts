import { PaymentEntity } from '@db/entities';
import { PaymentDto } from './PaymentDto';

export class FondyResponseDto {
	constructor(data: PaymentEntity[], total: number) {
		this.data = data.map((payment) => new PaymentDto(payment));
		this.total = total;
	}

	data: PaymentDto[];
	total: number;
}
