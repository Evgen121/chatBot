import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CallbackDto } from './dto/CallbackDto';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { Roles } from '@utils/decorators/roles.decorator';
import {
	ApiBody,
	ApiParam,
	ApiQuery,
	ApiResponse,
	ApiTags,
} from '@nestjs/swagger';
import { RectokenResponseDto } from './dto/RectokenResponseDto';
import { TOTPGuard } from '@utils/guards/totp.guard';
import { PaymentDto } from './dto/PaymentDto';
import { PromocodeDto } from './dto/PromocodeDto';

@ApiTags('Fondy')
@Controller('payment')
export class PaymentController {
	constructor(private readonly paymentService: PaymentService) {}

	@Post('callback')
	@HttpCode(200)
	async callback(@Body() body: CallbackDto) {
		await this.paymentService.handleCallback(body);
	}

	@ApiParam({
		name: 'id',
		description: 'Id of the rectoken',
		example: 3,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Delete('rectoken/:id')
	async deleteRectoken(@Req() req: any, @Param('id') id: number) {
		await this.paymentService.deleteRectoken(id, req.user.id);
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('cancel-subscription')
	async cancelSubscription(@Req() req: any) {
		return await this.paymentService.cancelSubscription(req.user.id);
	}

	@ApiQuery({
		name: 'rectokenId',
		required: true,
		description: 'id of the rectoken you want to set as a default',
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Post('default-rectoken')
	async updateDefaultRectoken(@Req() req: any, @Query() query: any) {
		await this.paymentService.setDefaultRectoken(req.user.id, query.rectokenId);
	}

	@ApiQuery({
		name: 'userId',
		required: true,
		description: 'user id',
	})
	@UseGuards(TOTPGuard)
	@Get('rectoken')
	async getRectokenById(@Query() query: any) {
		const rectoken = await this.paymentService.getRecTokenById(
			query.rectokenId,
			query.userId
		);
		if (!rectoken) {
			throw new NotFoundException();
		}
		return rectoken;
	}

	@ApiResponse({
		status: 200,
		description: 'Get rectokens',
		type: RectokenResponseDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('rectokens')
	async getRectokens(@Req() req: any) {
		return await this.paymentService.getRecTokens(req.user.id);
	}

	@ApiQuery({
		name: 'page',
		required: false,
		description: 'page number',
	})
	@ApiQuery({
		name: 'perPage',
		required: false,
		description: 'per Page number',
	})
	@ApiQuery({
		required: false,
		name: 'order',
		description:
			'order by any column, DESC or ASC. DESC means descending, ASC means ascending',
		example: 'id,DESC',
		enum: [
			'id,DESC',
			'amount,ASC',
			'order_time,DESC',
			'this is example you can set any column and order',
		],
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('history')
	async paymentHistory(@Query() query, @Req() req: any) {
		return await this.paymentService.getPaymentHistory(req.user.id, query);
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAllPayments(@Query() query) {
		const { data, total } = await this.paymentService.getAllPayments(query);
		return { data, total };
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		type: PaymentDto,
	})
	@Roles('admin')
	@Get(':id')
	async getOnePaymentById(@Param('id') id: number) {
		return await this.paymentService.getOnePaymentById(id);
	}

	@ApiResponse({
		status: 200,
		description: 'Success',
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async deletePaymentById(@Param('id') id: number) {
		await this.paymentService.deletePaymentById(id);
		return `Payment with ID ${id} has been deleted successfully`;
	}

	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@ApiBody({ type: PromocodeDto })
	@ApiParam({
		name: 'userId',
		description: 'The ID of the user who is using the promo code',
		example: 1,
		type: Number,
	})
	@ApiResponse({
		status: 200,
		description: 'Promo Code saved successfully',
		type: String,
	})
	@ApiResponse({
		status: 404,
		description: 'User or Promo code not found',
	})
	@ApiResponse({
		status: 409,
		description: 'User already has this promo code',
	})
	@Post('used-promocode')
	async usePromocode(@Body() dto: PromocodeDto, @Req() req: any) {
		const user = req.user;
		try {
			const message = await this.paymentService.saveUsePromoCode(user.id, dto);
			return { message };
		} catch (error) {
			return { error: error.message };
		}
	}
}
