import {
	Controller,
	Body,
	Post,
	Get,
	Delete,
	Param,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { CreateProductDto } from './dto/CreateProductDto';
import { AdminProductService } from './product.service';
import { UpdateProductDto } from './dto/UpdateProductDto';
import { Roles } from '@utils/decorators/roles.decorator';
import { JwtAuthGuard } from '@utils/guards/jwt.guard';
import { ApiBody, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductDto } from './dto/ProductDto';
import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { ProductResponseDto } from './dto/ProductResponseDto';
import { TOTPGuard } from '@utils/guards/totp.guard';
import { RetrieveChatbotProductDto } from './dto/RetrieveChatbotProductDto';
import { RetrieveContentProductDto } from './dto/RetrieveContentProductDto';
import { UserEntity } from '@db/entities';
import { RefundContentProductDto } from './dto/RefundContentProductDto';

@ApiTags('Admin_Product')
@Controller('admin/product')
export class AdminProductController {
	constructor(private readonly productService: AdminProductService) {}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_PRODUCT_BY_ID,
		type: ProductDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get(':id')
	async getOneById(@Param('id') id: number): Promise<ProductDto> {
		return await this.productService.getOneById(id);
	}

	@ApiParam({
		name: 'category',
		type: Number,
		required: true,
		example: 'content || chatbot',
	})
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_PRODUCT_BY_CATEGORY,
		type: ProductResponseDto,
	})
	@Roles('admin', 'user')
	@UseGuards(JwtAuthGuard)
	@Get('category/:category')
	async getByCategory(
		@Param('category') category: string
	): Promise<ProductResponseDto> {
		return await this.productService.getByCategory(category);
	}

	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_ALL_PRODUCTS,
		type: ProductResponseDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Get()
	async getAll() {
		return await this.productService.getAll();
	}

	@ApiBody({ type: CreateProductDto })
	@ApiResponse({
		status: 201,
		description: SwaggerComments.CREATE_PRODUCT,
		type: ProductDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Post()
	async create(@Body() createProductDto: CreateProductDto) {
		return await this.productService.create(createProductDto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.UPDATE_PRODUCT_BY_ID,
		type: ProductDto,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Patch(':id')
	async update(
		@Param('id') id: number,
		@Body() updateProductDto: UpdateProductDto
	) {
		return await this.productService.update(id, updateProductDto);
	}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.DELETE_PRODUCT_BY_ID,
		type: String,
	})
	@Roles('admin')
	@UseGuards(JwtAuthGuard)
	@Delete(':id')
	async delete(@Param('id') id: number) {
		return await this.productService.delete(id);
	}

	@ApiBody({ type: RetrieveContentProductDto })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.RETRIEVE_PURCHASED_PRODUCT_CONTENT,
		type: RetrieveContentProductDto,
	})
	@Post('retrieve/content')
	@UseGuards(TOTPGuard)
	async retrievePurchasedProductContent(
		@Body() dto: RetrieveContentProductDto
	): Promise<UserEntity> {
		return await this.productService.retrievePurchasedProductContent(dto);
	}

	@ApiBody({ type: RefundContentProductDto })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.REFUND_PURCHASED_PRODUCT_CONTENT,
		type: RefundContentProductDto,
	})
	@Post('refund/content')
	@UseGuards(TOTPGuard)
	async refundPurchasedProductContent(@Body() dto: RefundContentProductDto) {
		return await this.productService.refundPurchasedProductContent(dto);
	}

	@ApiBody({ type: RetrieveChatbotProductDto })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.RETRIEVE_PURCHASED_PRODUCT_CHATBOT,
		type: RetrieveChatbotProductDto,
	})
	@Post('retrieve/chatbot')
	@UseGuards(TOTPGuard)
	async retrievePurchasedProductChatbot(
		@Body() dto: RetrieveChatbotProductDto
	): Promise<UserEntity> {
		return await this.productService.retrievePurchasedProductChatbot(dto);
	}
}
