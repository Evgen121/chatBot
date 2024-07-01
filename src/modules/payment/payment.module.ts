import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
	PaymentEntity,
	ProductEntity,
	PromoCode,
	RectokenEntity,
	UserEntity,
} from '@db/entities';
import { AdminProductModule } from '../admin/product/product.module';
import { TOTPService } from '@shared/services/totp.service';
import { SharedModule } from '@shared/shared.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			PaymentEntity,
			ProductEntity,
			UserEntity,
			RectokenEntity,
			PromoCode,
		]),
		AdminProductModule,
		SharedModule,
	],
	controllers: [PaymentController],
	providers: [PaymentService, TOTPService],
	exports: [PaymentService],
})
export class PaymentModule {}
