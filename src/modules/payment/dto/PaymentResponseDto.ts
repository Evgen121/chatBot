import { PaymentEntity } from '@db/entities';
import { PaymentDto } from './PaymentDto';

export class PaymentResponseDto {
	constructor(payments: PaymentEntity[], count: number, totalPages: number) {
		this.result = payments.map((payment) => new PaymentDto(payment));
		this.count = count;
		this.totalPages = totalPages;
	}

	result: PaymentDto[];

	count: number;

	totalPages: number;
}
