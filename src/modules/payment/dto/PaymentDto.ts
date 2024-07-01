import { PaymentEntity, UserEntity } from '@db/entities';
import { ProductDto } from '@modules/admin/product/dto/ProductDto';

export class PaymentDto {
	constructor(payment: PaymentEntity) {
		this.id = payment.id;
		this.order_id = payment.order_id;
		this.order_time = payment.order_time;
		this.payment_id = payment.payment_id;
		this.createdAt = payment.createdAt;
		this.masked_card = payment.masked_card;
		this.card_type = payment.card_type;
		this.amount = payment.amount;
		this.order_status = payment.order_status;
		this.actual_amount = payment.actual_amount;
		this.currency = payment.currency;
		this.actual_currency = payment.actual_currency;
		this.merchant_data = payment.merchant_data;
		this.product = payment.product ? new ProductDto(payment.product) : null;
		this.user = payment.user;
	}

	id: number;
	order_id: string;
	order_time: string;
	payment_id: number;
	createdAt: Date;
	masked_card: string;
	card_type: string;
	amount: string;
	actual_amount: string;
	currency: string;
	order_status: string;
	actual_currency: string;
	merchant_data: string;
	product: ProductDto;
	user: UserEntity;
}
