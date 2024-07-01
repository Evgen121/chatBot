import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { ChatBotEntity, ProductEntity, UserEntity } from '@db/entities';
import { CreateProductDto } from './dto/CreateProductDto';
import { ProductDto } from './dto/ProductDto';
import { UpdateProductDto } from './dto/UpdateProductDto';
import { ProductResponseDto } from './dto/ProductResponseDto';
import { RetrieveChatbotProductDto } from './dto/RetrieveChatbotProductDto';
import { RetrieveContentProductDto } from './dto/RetrieveContentProductDto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '@modules/email/emailTemplate.enum';
import { SendEmailService } from '@modules/email/sendEmail.service';

@Injectable()
export class AdminProductService {
	constructor(
		@InjectRepository(ProductEntity)
		private readonly productRepository: Repository<ProductEntity>,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		private readonly emailService: SendEmailService
	) {}

	async create(dto: CreateProductDto): Promise<ProductDto> {
		const product = await this.productRepository.save(dto);

		return new ProductDto(product);
	}

	async update(id: number, dto: UpdateProductDto): Promise<ProductDto> {
		await this.productRepository.update(id, dto);
		const product = await this.productRepository.findOne({ where: { id } });

		return new ProductDto(product);
	}

	async getAll(): Promise<ProductResponseDto> {
		const [products, count] = await this.productRepository.findAndCount();
		return new ProductResponseDto(products, count);
	}

	async getOneById(id: number): Promise<ProductDto> {
		const product = await this.productRepository.findOne({ where: { id } });

		if (!product) {
			throw new NotFoundException(`Product with id ${id} not found`);
		}

		return new ProductDto(product);
	}

	async getByCategory(category: string): Promise<ProductResponseDto> {
		const [products, count] = await this.productRepository.findAndCount({
			where: { category },
		});
		return new ProductResponseDto(products, count);
	}

	async delete(id: number): Promise<ProductDto> {
		const product = await this.productRepository.findOne({ where: { id } });

		if (!product) {
			throw new NotFoundException(`Product with id ${id} not found`);
		}

		await this.productRepository.delete(id);

		return new ProductDto(product);
	}

	async retrievePurchasedProductContent(dto: RetrieveContentProductDto) {
		const user = await this.usersRepository.findOne({
			where: { id: dto.userId },
		});
		const product = await this.productRepository.findOne({
			where: { id: dto.productId },
		});

		if (!user) {
			throw new NotFoundException(`User with id ${dto.userId} not found`);
		}

		user.contenterPoints += product.productValue;

		await this.usersRepository.save(user);
		return user;
	}

	async refundPurchasedProductContent(dto: RetrieveContentProductDto) {
		const user = await this.usersRepository.findOne({
			where: { id: dto.userId },
		});
		const product = await this.productRepository.findOne({
			where: { id: dto.productId },
		});

		if (!user) {
			throw new NotFoundException(`User with id ${dto.userId} not found`);
		}

		if (user.contenterPoints < product.productValue) {
			throw new BadRequestException(
				`User with id ${dto.userId} does not have enough points`
			);
		}

		user.contenterPoints -= product.productValue;

		await this.usersRepository.save(user);

		return user;
	}

	async retrievePurchasedProductChatbot(dto: RetrieveChatbotProductDto) {
		const user = await this.usersRepository.findOne({
			where: { id: dto.userId },
			relations: { chatBots: true },
		});

		if (!user) {
			throw new NotFoundException(`User with id ${dto.userId} not found`);
		}

		if (!user.subscriptionDueDate) {
			await this.emailService.sendEmailByTemplate(EmailTemplate.Subscribe, {
				email: user.email,
			});
		}
		const newDueDate = dto.periodEnd * 1000;

		user.subscriptionDueDate = new Date(newDueDate);
		user.subscriptionId = dto.subscriptionId;

		if (dto.periodEnd * 1000 < Date.now()) {
			user.chatBots.forEach((chatbot) => {
				chatbot.isActive = false;
			});
		} else {
			user.chatBots.forEach((chatbot) => {
				chatbot.isActive = true;
			});
		}

		await this.usersRepository.save(user);

		return user;
	}
}
