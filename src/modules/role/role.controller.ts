import { Controller, Get } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleResponseDto } from './dto/RoleResponseDto';
import { ApiResponse } from '@nestjs/swagger';

@Controller('role')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@ApiResponse({
		type: RoleResponseDto,
	})
	@Get()
	async getAllRoles(): Promise<RoleResponseDto> {
		return await this.roleService.getAllRoles();
	}
}
