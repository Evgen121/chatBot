import { PromoCode } from '@/src/db/entities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreatePromoCodeDto } from './dto/createPromoCodeDto';
import { UpdatePromoCodeDto } from './dto/updatePromoCodeDto';
import { PromocodeResponseDto } from './dto/promocodeResponseDto';
import { ChatBotService } from '../../chatBot/services/chatBot.service';

@Injectable()
export class AdminPromocodeService {
	constructor(
		@InjectRepository(PromoCode)
		private promoCodeRepository: Repository<PromoCode>
	) {}

	async createPromoCode(dto: CreatePromoCodeDto): Promise<PromoCode> {
		const promoCode = new PromoCode();
		promoCode.discount = dto.discount;
		promoCode.promoCode = this.generateRandomPromoCode(6);

		return this.promoCodeRepository.save(promoCode);
	}

	generateRandomPromoCode(length: number): string {
		const charset =
			'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		let password = '';
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * charset.length);
			password += charset.charAt(randomIndex);
		}

		return password;
	}

	async getAllPromoCode() {
		const [promocode, total] = await this.promoCodeRepository.findAndCount();
		return new PromocodeResponseDto(promocode, total);
	}

	async updatePromoCode(
		id: number,
		dto: UpdatePromoCodeDto
	): Promise<PromoCode> {
		const promoCode = await this.promoCodeRepository.findOne({
			where: { id },
		});
		if (!promoCode) {
			throw new Error('PromoCode not found');
		}
		promoCode.discount = dto.discount;
		return this.promoCodeRepository.save(promoCode);
	}

	async getPromocodeById(id: number) {
		const promoCode = await this.promoCodeRepository.findOne({
			where: { id },
		});
		if (!promoCode) {
			throw new NotFoundException(`PromoCode with id ${id} not found`);
		}
		return promoCode;
	}

	async delete(id: number) {
		const promoCode = await this.promoCodeRepository.findOne({ where: { id } });
		if (!promoCode) {
			throw new NotFoundException(`PromoCode with id ${id} not found`);
		}
		await this.promoCodeRepository.delete(id);
	}
}
