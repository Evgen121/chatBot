import {
	Body,
	Param,
	Controller,
	Delete,
	Get,
	Patch,
	Query,
	Req,
	UseGuards,
	UnauthorizedException,
	Post,
} from '@nestjs/common';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { UserEntity } from '@db/entities';
import { AdminUserService } from './admin.user.service';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { UpdateUserDto } from '@modules/user/dto/UpdateUserDto';
import { UserWithJwtDto } from '@/src/modules/user/dto/UserWithJwtDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { TOTPGuard } from '@utils/guards/totp.guard';

@ApiTags('Admin_User')
@Controller('admin/users')
export class AdminController {
	constructor(private readonly adminUserService: AdminUserService) {}

	@ApiResponse({ status: 200, type: UserWithJwtDto })
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllUsers(
		@Query() query: any
	): Promise<{ data: UserEntity[]; total: number }> {
		const { data, total } = await this.adminUserService.getAllUsers(query);
		return { data, total };
	}

	@ApiResponse({ status: 200, type: UserWithJwtDto })
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async findOneById(@Param('id') id: number): Promise<UserEntity> {
		const user = await this.adminUserService.findOneByIdWithChatBots(id);
		return user;
	}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.UPDATE_USER,
	})
	@ApiBody({ type: UpdateUserDto })
	@Patch(':id')
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	async updateUser(
		@Param('id') id: number,
		@Body() partial: Partial<UserEntity>
	) {
		const updatedStatus = await this.adminUserService.updateUser(id, partial);
		return { data: updatedStatus, id };
	}

	@ApiResponse({ status: 200 })
	@ApiBody({
		description: SwaggerComments.DELETE_USER_BY_ID,
	})
	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.DELETE_USER_BY_ID,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deleteUserAdmin(@Req() req, @Param('id') id: number) {
		if (req.user.id === id) {
			throw new UnauthorizedException('You can not delete yourself');
		}
		await this.adminUserService.deleteUserAdmin(id);
	}

	@UseGuards(TOTPGuard)
	@Post('update-subscription')
	async updateUserSubscription(@Body() body: any) {
		const { userId, subscriptionId } = body;

		const updatedStatus = await this.adminUserService.updateUser(userId, {
			subscriptionId,
		});

		return { data: updatedStatus, userId };
	}
}
