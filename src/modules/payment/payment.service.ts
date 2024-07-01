import {
	ConflictException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, LessThan, Not, Raw, Repository } from 'typeorm';
import axios from 'axios';

import {
	PaymentEntity,
	ProductEntity,
	PromoCode,
	RectokenEntity,
	UserEntity,
} from '@db/entities';
import { CallbackDto } from './dto/CallbackDto';
import { AdminProductService } from '../admin/product/product.service';
import { RectokenResponseDto } from './dto/RectokenResponseDto';
import { TOTPService } from '@shared/services/totp.service';
import { PaymentResponseDto } from './dto/PaymentResponseDto';
import { RectokenDto } from './dto/RectokenDto';
import { FondyResponseDto } from './dto/FondyResponseDto';
import { ErrorMessages } from '@/src/utils/errors/errors';
import { PromocodeDto } from './dto/PromocodeDto';

@Injectable()
export class PaymentService {
	private readonly logger: Logger;

	constructor(
		private readonly productService: AdminProductService,
		private readonly totpService: TOTPService,

		@InjectRepository(ProductEntity)
		private readonly productRepository: Repository<ProductEntity>,
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(PromoCode)
		private readonly promoCodeRepository: Repository<PromoCode>,
		@InjectRepository(RectokenEntity)
		private readonly recTokenRepository: Repository<RectokenEntity>,
		@InjectRepository(PaymentEntity)
		private readonly paymentRepository: Repository<PaymentEntity>
	) {
		this.logger = new Logger(PaymentService.name);
	}

	async getRecTokens(userId: number) {
		const [tokens, count] = await this.recTokenRepository.findAndCount({
			where: {
				user: { id: userId },
			},
			select: ['id', 'card_type', 'masked_card', 'rectoken_lifetime', 'user'],
			relations: ['user'],
		});

		return new RectokenResponseDto(tokens, count);
	}

	async getRecTokenById(rectokenId: number, userId: number) {
		const rectoken = await this.recTokenRepository.findOne({
			where: {
				id: rectokenId,
				user: { id: userId },
			},
		});
		if (!rectoken) {
			throw new NotFoundException('Rectoken not found');
		}

		return new RectokenDto(rectoken);
	}

	async cancelSubscription(userId: number) {
		const user = await this.userRepository.findOne({
			where: {
				id: userId,
			},
		});
		user.subscriptionId = null;
		user.subscriptionDueDate = null;
		await this.userRepository.save(user);
	}

	async deleteRectoken(recrokenId: number, userId: number) {
		await this.recTokenRepository.delete({
			id: recrokenId,
			user: { id: userId },
		});
	}

	async setDefaultRectoken(userId: number, rectokenId: number) {
		const rectoken = await this.recTokenRepository.findOne({
			where: {
				user: { id: userId },
				id: rectokenId,
			},
			relations: ['user'],
		});

		if (!rectoken) {
			throw new NotFoundException('Token does not exist');
		}

		await this.userRepository.save({
			id: userId,
			defaultRectoken: rectoken,
		});
	}

	async updateSubscriptions() {
		const usersToUpdate = await this.userRepository.find({
			where: {
				subscriptionDueDate: LessThan(new Date()),
				subscriptionId: Not(ILike('sub%')),
			},
			relations: ['defaultRectoken'],
		});

		this.logger.log(
			`Updating subscriptions for ${
				usersToUpdate.length
			} users with ids: ${usersToUpdate.map((user) => user.id)}`
		);

		usersToUpdate.map(async (user) => {
			this.checkoutWithRectoken(
				Number(user.subscriptionId),
				user.id,
				user.defaultRectoken.id
			);
		});
	}

	async checkoutWithRectoken(
		productId: number,
		userId: number,
		rectokenId: number
	) {
		try {
			const url =
				process.env.PAYMENT_SERVICE_URL +
				'/fondy/recurrent/update-subscription';
			await axios.post(
				url,
				{
					productId,
					userId,
					rectokenId,
					order_desc: 'subscription update',
				},
				{
					headers: {
						'Content-Type': 'application/json',
						totpcode: this.totpService.generateTOTP(),
					},
				}
			);
		} catch {}
	}

	async getPaymentHistory(userId: number, query: any) {
		const order = query?.order ? query?.order?.split(',') : null;

		const [payments, count] = await this.paymentRepository.findAndCount({
			where: {
				user: { id: userId },
			},
			relations: ['product'],
			order: order ? { [order[0]]: order[1] } : null,
			skip: query?.page ? (query?.page - 1) * query?.perPage : 0,
			take: query?.perPage || 10,
		});
		const totalPages = Math.ceil(count / (query?.perPage || 10));

		return new PaymentResponseDto(payments, count, totalPages);
	}

	async handleCallback(dto: CallbackDto) {
		const merchantData = JSON.parse(dto.merchant_data);
		const productId = merchantData.productId;
		const userId = merchantData.userId;
		const promoCode = merchantData.promoCode;
		const product = await this.productRepository.findOne({
			where: { id: productId },
		});
		const promo = await this.promoCodeRepository.findOne({
			where: { id: promoCode },
		});

		if (!promo) {
			throw new NotFoundException('Promo code not found');
		}
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['promocodes'],
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const hasPromoCode = user.promocodes.some((p) => p.id === promo.id);
		if (hasPromoCode) {
			return;
		}
		user.promocodes.push(promo);

		await this.userRepository.save(user);

		if (dto.order_status === 'reversed') {
			const existingPayment = await this.paymentRepository.findOne({
				where: { order_id: dto.order_id },
			});

			if (existingPayment) {
				await this.paymentRepository.update(
					{ id: existingPayment.id },
					{
						amount: dto.amount,
						currency: dto.currency,
						actual_amount: dto.actual_amount,
						actual_currency: dto.actual_currency,
						card_type: dto.card_type,
						masked_card: dto.masked_card,
						merchant_data: dto.merchant_data,
						order_status: dto.order_status,
						order_time: dto.order_time,
						payment_id: dto.payment_id,
						user: user,
						product: product,
					}
				);
				return;
			}
		} else if (
			!product ||
			!user ||
			!dto.rectoken ||
			dto.order_status !== 'approved'
		) {
			return;
		}

		let recToken = await this.recTokenRepository.findOne({
			where: {
				user: { id: userId },
				recToken: dto.rectoken,
			},
			relations: ['user'],
		});

		if (!recToken) {
			await this.recTokenRepository.save({
				recToken: dto.rectoken,
				masked_card: dto.masked_card,
				card_type: dto.card_type,
				rectoken_lifetime: dto.rectoken_lifetime,
				user,
			});

			recToken = await this.recTokenRepository.findOne({
				where: {
					user: { id: userId },
					recToken: dto.rectoken,
				},
				relations: ['user'],
			});
		}

		await this.paymentRepository.save({
			amount: dto.amount,
			currency: dto.currency,
			actual_amount: dto.actual_amount,
			actual_currency: dto.actual_currency,
			card_type: dto.card_type,
			masked_card: dto.masked_card,
			merchant_data: dto.merchant_data,
			order_id: dto.order_id,
			order_status: dto.order_status,
			order_time: dto.order_time,
			payment_id: dto.payment_id,
			recToken: { id: recToken.id },
			user: user,
			product: product,
		});

		if (promoCode) {
			const discountAmount =
				(product.priceInCentsUSD * promoCode.discount) / 100;
			const discountedPrice = product.priceInCentsUSD - discountAmount;

			if (
				product.priceInCentsUSD !== parseInt(dto.amount) ||
				discountedPrice !== parseInt(dto.amount)
			) {
				return;
			}

			product.priceInCentsUSD = discountedPrice;
		}

		if (product.category === 'chatbot') {
			user.defaultRectoken = recToken;
			await this.userRepository.save(user);

			const periodEnd = new Date().getTime() / 1000 + product.productValue;
			await this.productService.retrievePurchasedProductChatbot({
				userId: user.id,
				periodEnd: periodEnd,
				subscriptionId: String(product.id),
			});
		} else if (product.category === 'content') {
			await this.productService.retrievePurchasedProductContent({
				userId: user.id,
				productId: product.id,
			});
		}
	}

	async getAllPayments(query: any): Promise<FondyResponseDto> {
		const { filter, sort, limit, page } = query;
		const whereCondition = {};
		for (const key in filter) {
			if (filter.hasOwnProperty(key)) {
				const filterValue = query.filter[key]?.split('||');
				const filterField = filterValue && filterValue[0];

				const filterQuery =
					filterValue && decodeURI(filterValue[2]).toLowerCase();

				if (filterField === 'user.email' && filterQuery) {
					whereCondition['user'] = { email: ILike(`%${filterQuery}%`) };
				} else if (filterField === 'createdAt' && filterQuery) {
					whereCondition['createdAt'] = Raw(
						(alias) =>
							`TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterQuery}%'`
					);
				} else {
					whereCondition[filterField] = ILike(`%${filterQuery}%`);
				}
			}
		}
		const order = sort && sort[0]?.split(',');
		const take = limit || 10;
		const skip = page ? (page - 1) * take : 0;

		const [payment, total] = await Promise.all([
			this.paymentRepository.find({
				where: whereCondition,
				order: order ? { [order[0]]: order[1] } : {},
				take,
				skip,
				relations: { user: true },
			}),
			this.paymentRepository.count({
				where: whereCondition,
			}),
		]);
		return new FondyResponseDto(payment, total);
	}

	async getOnePaymentById(id: number) {
		const payment = await this.paymentRepository.findOne({
			where: { id },
			relations: { user: true },
		});
		if (!payment) {
			throw new NotFoundException(`Payment with id ${id} not found`);
		}
		return payment;
	}

	async deletePaymentById(id: number) {
		const payment = await this.paymentRepository.findOne({ where: { id } });
		if (!payment) {
			throw new NotFoundException(`Payment with id ${id} not found`);
		}
		await this.paymentRepository.remove(payment);
	}

	async saveUsePromoCode(userId: number, dto: PromocodeDto): Promise<any> {
		const user = await this.userRepository.findOne({
			where: { id: userId },
			relations: ['promocodes'],
		});

		if (!user) {
			throw new NotFoundException('User not found');
		}

		const promo = await this.promoCodeRepository.findOne({
			where: { promoCode: dto.promoCode },
		});

		if (!promo) {
			throw new NotFoundException('Promo code not found');
		}

		const hasPromoCode = user.promocodes.some((p) => p.id === promo.id);
		if (hasPromoCode) {
			throw new ConflictException('User already has this promo code');
		}

		user.promocodes.push(promo);

		await this.userRepository.save(user);
		return 'Promo Code saved successfully';
	}
}
