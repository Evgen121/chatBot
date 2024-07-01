import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './ProductDto';
import { ProductEntity } from '@db/entities';

export class ProductResponseDto {
	constructor(data: ProductEntity[], total: number) {
		this.data = data.map((product) => new ProductDto(product));
		this.total = total;
	}

	@ApiProperty({
		type: [ProductDto],
		description: 'List of products',
	})
	data: ProductDto[];

	@ApiProperty({
		type: Number,
		description: 'Total number of products',
	})
	total: number;
}
