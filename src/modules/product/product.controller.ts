import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SwaggerComments } from '@utils/swagger/swaggerComments';
import { ProductDto } from '../admin/product/dto/ProductDto';
import { ProductResponseDto } from '../admin/product/dto/ProductResponseDto';
import { AdminProductService } from '../admin/product/product.service';

@ApiTags('Product')
@Controller('product')
export class ProductController {
	constructor(private readonly productService: AdminProductService) {}

	@ApiParam({ name: 'id', type: Number, required: true, example: 1 })
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_PRODUCT_BY_ID,
		type: ProductDto,
	})
	@Get(':id')
	async getOneById(@Param('id') id: number): Promise<ProductDto> {
		return await this.productService.getOneById(id);
	}

	@ApiParam({
		name: 'category',
		type: String,
		required: true,
		example: 'content || chatbot',
	})
	@ApiResponse({
		status: 200,
		description: SwaggerComments.FIND_PRODUCT_BY_CATEGORY,
		type: ProductResponseDto,
	})
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
	@Get()
	async getAll() {
		return await this.productService.getAll();
	}
}
