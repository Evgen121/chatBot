import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScriptEntity, UserEntity } from '@db/entities';
import { Repository } from 'typeorm';
import { ScriptResponseDto } from './dto/ScriptResponseDto';
import { CreateScriptDto } from './dto/CreateScriptDto';
import { ScriptDto } from './dto/ScriptDto';
import { UpdateScriptDto } from './dto/UpdateScriptDto';

@Injectable()
export class ScriptService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly userEntity: Repository<UserEntity>,
		@InjectRepository(ScriptEntity)
		private readonly scriptRepository: Repository<ScriptEntity>
	) {}

	async getAllScripts(): Promise<ScriptResponseDto> {
		const [script, total] = await this.scriptRepository.findAndCount();
		return new ScriptResponseDto(script, total);
	}

	async addScript(dto: CreateScriptDto): Promise<ScriptDto> {
		const script = await this.scriptRepository.save(dto);
		return new ScriptDto(script);
	}

	async getOneScriptById(id: number) {
		const script = await this.scriptRepository.findOne({ where: { id } });
		if (!script) {
			throw new NotFoundException(`Script with id ${id} not found`);
		}
		return script;
	}

	async update(id: number, dto: UpdateScriptDto): Promise<ScriptDto> {
		await this.scriptRepository.update(id, dto);
		const script = await this.scriptRepository.findOne({ where: { id } });
		return new ScriptDto(script);
	}

	async delete(id: number): Promise<ScriptDto> {
		const script = await this.scriptRepository.findOne({ where: { id } });
		if (!script) {
			throw new NotFoundException(`Script with id ${id} not found`);
		}
		await this.scriptRepository.delete(id);
		return new ScriptDto(script);
	}
}
