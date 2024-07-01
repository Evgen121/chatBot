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
import { StructureResponseDto } from './dto/StructureResponseDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { StructureService } from './structure.service';
import { CreateStructureDto } from './dto/CreateStructureDto';
import { StructureDto } from './dto/StructureDto';
import { UpdateStructureDto } from './dto/UpdateStructureDto';

@ApiTags('Structure')
@Controller('admin/structure')
export class StructureController {
	constructor(private readonly structureService: StructureService) {}

	@ApiResponse({ status: 200, type: StructureResponseDto })
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllStruct() {
		const { data, total } = await this.structureService.getAllStruct();
		return { data, total };
	}

	@ApiResponse({ status: 201, type: CreateStructureDto })
	@ApiBody({
		type: CreateStructureDto,
		description: SwaggerComments.CREATE_SCRIPT,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Post()
	async addStructure(@Body() dto: CreateStructureDto) {
		return await this.structureService.addStructure(dto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_STRUCTURE_BY_ID,
		type: StructureDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async getStructById(@Param('id') id: number) {
		return await this.structureService.getStructById(id);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.UPDATE_STRUCTURE_BY_ID,
		type: StructureDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async update(@Param('id') id: number, @Body() dto: UpdateStructureDto) {
		return await this.structureService.update(id, dto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETE_STRUCTURE_BY_ID,
		type: String,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async delete(@Param('id') id: number) {
		return await this.structureService.delete(id);
	}
}
