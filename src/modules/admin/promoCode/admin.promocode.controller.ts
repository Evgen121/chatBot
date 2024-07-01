import { ApiTags } from '@nestjs/swagger';
import {
	Controller,
	Body,
	Post,
	Patch,
	Param,
	Get,
	Query,
	UseGuards,
	Delete,
} from '@nestjs/common';
import { AdminPromocodeService } from './admin.promocode.service';
import { CreatePromoCodeDto } from './dto/createPromoCodeDto';
import { UpdatePromoCodeDto } from './dto/updatePromoCodeDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';

@ApiTags('Admin_Promocode')
@Controller('admin/promocode')
export class PromocodeController {
	constructor(private readonly adminPromocodeService: AdminPromocodeService) {}

	@Roles('admin')
	@Post()
	async createPromoCode(@Body() dto: CreatePromoCodeDto) {
		const createdPromoCode = await this.adminPromocodeService.createPromoCode(
			dto
		);
		return createdPromoCode;
	}

	@Roles('admin')
	@Get()
	async getAllPromoCode() {
		const { data, total } = await this.adminPromocodeService.getAllPromoCode();
		return { data, total };
	}

	@Roles('admin')
	@Get(':id')
	async getPromocodeById(@Param('id') id: number) {
		return await this.adminPromocodeService.getPromocodeById(id);
	}

	@Roles('admin')
	@Patch(':id')
	async updatePromoCode(
		@Param('id') id: number,
		@Body() dto: UpdatePromoCodeDto
	) {
		const updatedPromoCode = await this.adminPromocodeService.updatePromoCode(
			id,
			dto
		);
		return updatedPromoCode;
	}

	@Roles('admin')
	@Delete(':id')
	async delete(@Param('id') id: number) {
		return await this.adminPromocodeService.delete(id);
	}
}
