import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CssStyleEntity, UserEntity } from '@db/entities';
import { ILike, Repository } from 'typeorm';
import { StyleResponseDto } from './dto/StyleResponseDto';
import { CreateStyleDto } from './dto/CreateStyleDto';
import { StyleDto } from './dto/StyleDto';
import { UpdateStyleDto } from './dto/UpdateStyleDto';

@Injectable()
export class StyleService {
	constructor(
		@InjectRepository(CssStyleEntity)
		private readonly styleRepository: Repository<CssStyleEntity>,
		@InjectRepository(UserEntity)
		private readonly userEntity: Repository<UserEntity>
	) {}

	async getOneStyleById(id: number) {
		const style = await this.styleRepository.findOne({
			where: { id },
			relations: { structure: true },
		});
		if (!style) {
			throw new NotFoundException(`Style with id ${id} not found`);
		}
		return style;
	}
	async getAllStylies(query: any): Promise<StyleResponseDto> {
		const filter = query.filter || {};
		const whereCondition = {};

		for (const key in filter) {
			if (filter.hasOwnProperty(key)) {
				const filterValue = filter[key]?.split('||');
				const filterField = filterValue && filterValue[0];
				const filterQuery =
					filterValue && decodeURI(filterValue[2]).toLowerCase();

				if (filterField === 'cssName' && filterQuery) {
					whereCondition['cssName'] = ILike(`%${filterQuery}%`);
				}
			}
		}

		const [style, total] = await this.styleRepository.findAndCount({
			where: whereCondition,
		});

		return new StyleResponseDto(style, total);
	}

	async addStyle(dto: CreateStyleDto): Promise<StyleDto> {
		const style = await this.styleRepository.save(dto);
		return new StyleDto(style);
	}

	async update(id: number, dto: UpdateStyleDto): Promise<StyleDto> {
		await this.styleRepository.update(id, dto);
		const style = await this.styleRepository.findOne({ where: { id } });

		return new StyleDto(style);
	}

	async delete(id: number): Promise<StyleDto> {
		const style = await this.styleRepository.findOne({ where: { id } });
		if (!style) {
			throw new NotFoundException(`Style with id ${id} not found`);
		}
		await this.styleRepository.delete(id);
		return new StyleDto(style);
	}
}
