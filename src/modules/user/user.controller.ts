import {
	Body,
	Controller,
	Get,
	Delete,
	Patch,
	Req,
	UseGuards,
	InternalServerErrorException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { ApiResponse, ApiTags, ApiBody } from '@nestjs/swagger';
import { ErrorMessages } from '@utils/errors/errors';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { Roles } from '@utils/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.GET_USER_INFO,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getUserInfo(@Req() req: any) {
		const user = req.user;

		return await this.userService.publicUser(user.email);
	}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.UPDATE_USER,
	})
	@ApiBody({ type: UpdateUserDto })
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Patch()
	async updateUser(@Body() updateDto: UpdateUserDto, @Req() req: any) {
		try {
			const user = req.user;
			await this.userService.updateUser(user.email, updateDto);
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.user.UPDATE_USER_FAILED
			);
		}
	}

	@ApiResponse({
		status: 200,
		type: String,
		description: SwaggerComments.DELETE_USER,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete()
	async deleteUser(@Req() req: any) {
		try {
			const user = req.user;
			await this.userService.deleteUser(user.email);
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.user.DELETE_USER_FAILED
			);
		}
	}
}
