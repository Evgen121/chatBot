import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RoleResponseDto } from './dto/RoleResponseDto';
import { RoleEntity } from '@db/entities';

@Injectable()
export class RoleService {
	constructor(
		@InjectRepository(RoleEntity)
		private readonly roleRepository: Repository<RoleEntity>
	) {}

	async getAllRoles() {
		const [roles, total] = await this.roleRepository.findAndCount({});
		return new RoleResponseDto(roles, total);
	}
}
