import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CssStyleEntity, StructureEntity, UserEntity } from '@db/entities';
import { Repository } from 'typeorm';
import { StructureResponseDto } from './dto/StructureResponseDto';
import { CreateStructureDto } from './dto/CreateStructureDto';
import { UpdateStructureDto } from './dto/UpdateStructureDto';
import { StructureDto } from './dto/StructureDto';

@Injectable()
export class StructureService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userEntity: Repository<UserEntity>,
		@InjectRepository(StructureEntity)
		private readonly structureRepository: Repository<StructureEntity>,
		@InjectRepository(CssStyleEntity)
		private readonly styleCssRepository: Repository<CssStyleEntity>
	) {}

	async getAllStruct() {
		const [sturcture, total] = await this.structureRepository.findAndCount();
		return new StructureResponseDto(sturcture, total);
	}

	async addStructure(dto: CreateStructureDto): Promise<StructureDto> {
		const structure = await this.structureRepository.save(dto);
		return new StructureDto(structure);
	}

	async getStructById(id: number) {
		const structure = await this.structureRepository.findOne({
			where: { id },
			relations: { styleCss: true },
		});
		if (!structure) {
			throw new NotFoundException(`Structur with id ${id} not found`);
		}
		return structure;
	}

	async update(id: number, dto: UpdateStructureDto): Promise<StructureDto> {
		await this.structureRepository.update(id, dto);
		const structure = await this.structureRepository.findOne({ where: { id } });
		if (!structure) {
			throw new NotFoundException(`Structuree with id ${id} not found`);
		}
		return new StructureDto(structure);
	}

	async delete(id: number) {
		const structure = await this.structureRepository.findOne({ where: { id } });
		if (!structure) {
			throw new NotFoundException(`Structuree with id ${id} not found`);
		}
		await this.structureRepository.delete(id);
	}
}
