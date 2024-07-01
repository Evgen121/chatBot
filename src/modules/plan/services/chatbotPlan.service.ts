import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { ProductEntity, UserEntity } from '@db/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ChatbotPlanService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>,
		@InjectRepository(ProductEntity)
		private readonly productRepository: Repository<ProductEntity>
	) {}

	async getChatbotSubscriptionInfo(subscriptionId: string) {
		if (!subscriptionId) {
			return {
				maxBotsAllowedToCreate: 1,
				requestsPerMonth: 2000,
				snippetsAvailable: 300,
			};
		}

		if (subscriptionId.startsWith('sub_')) {
			try {
				const url =
					process.env.PAYMENT_SERVICE_URL +
					'/stripe/subscription/' +
					subscriptionId;
				const response = await axios.get(url);
				return response.data.plan.product.metadata;
			} catch (error) {
				throw new HttpException(
					error.response.data.message,
					error.response.data.statusCode
				);
			}
		} else {
			const product = await this.productRepository.findOne({
				where: { id: Number(subscriptionId) },
			});
			return product?.metadata;
		}
	}

	async getChatbotSubscriptionByEmail(email: string) {
		try {
			const subscription = await axios.get(
				process.env.PAYMENT_SERVICE_URL + '/stripe/subscription/info/' + email
			);
			return subscription?.data?.data[0];
		} catch {
			return null;
		}
	}
}
