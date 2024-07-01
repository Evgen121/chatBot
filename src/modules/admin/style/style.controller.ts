import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { StyleDto } from './dto/StyleDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { CreateStyleDto } from './dto/CreateStyleDto';
import { StyleService } from './style.srvice';
import { UpdateStyleDto } from './dto/UpdateStyleDto';
import { StyleResponseDto } from './dto/StyleResponseDto';

@ApiTags('Style')
@Controller('admin/style')
export class StyleController {
	constructor(private readonly styleService: StyleService) {}

	@ApiResponse({ status: 200, type: StyleResponseDto })
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllStylies(@Query() query: any) {
		const { data, total } = await this.styleService.getAllStylies(query);
		return { data, total };
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_STYLE_BY_NAME,
		type: StyleDto,
	})
	@Roles('admin')
	@Get(':id')
	async getOneStyleById(@Param('id') id: number) {
		return await this.styleService.getOneStyleById(id);
	}

	@ApiResponse({ status: 201, type: CreateStyleDto })
	@Roles('admin')
	@ApiBody({
		type: CreateStyleDto,
		description: SwaggerComments.CREATE_STYLE,
	})
	@Post()
	async addStyleCss(@Body() dto: CreateStyleDto) {
		return await this.styleService.addStyle(dto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.UPDATE_STYLE_BY_ID,
		type: StyleDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async update(
		@Param('id') id: number,
		@Body() updateStyleDto: UpdateStyleDto
	) {
		return await this.styleService.update(id, updateStyleDto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETE_STYLE_BY_ID,
		type: String,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async delete(@Param('id') id: number) {
		return await this.styleService.delete(id);
	}
}
