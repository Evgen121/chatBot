import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { CreateScriptDto } from './dto/CreateScriptDto';
import { ScriptResponseDto } from './dto/ScriptResponseDto';
import { Roles } from '@utils/decorators/roles.decorator';

import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { ScriptDto } from './dto/ScriptDto';
import { ScriptService } from './script.service';
import { UpdateScriptDto } from './dto/UpdateScriptDto';

@ApiTags('Script')
@Controller('admin/script')
export class ScriptController {
	constructor(private readonly scriptService: ScriptService) {}

	@ApiResponse({ status: 201, type: CreateScriptDto })
	@ApiBody({
		type: CreateScriptDto,
		description: SwaggerComments.CREATE_SCRIPT,
	})
	@Post()
	async addScript(@Body() dto: CreateScriptDto) {
		return await this.scriptService.addScript(dto);
	}

	@ApiResponse({ status: 200, type: ScriptResponseDto })
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllScripts() {
		const { data, total } = await this.scriptService.getAllScripts();
		return { data, total };
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_SCRIPT_BY_ID,
		type: ScriptDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async getOneScriptById(@Param('id') id: number) {
		return await this.scriptService.getOneScriptById(id);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.UPDATE_SCRIPT_BY_ID,
		type: ScriptDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async update(
		@Param('id') id: number,
		@Body() updateScriptDto: UpdateScriptDto
	) {
		return await this.scriptService.update(id, updateScriptDto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETE_SCRIPT_BY_ID,
		type: String,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async delete(@Param('id') id: number) {
		return await this.scriptService.delete(id);
	}
}
