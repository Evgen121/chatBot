import { ApiProperty } from '@nestjs/swagger';
import { ProductEntity } from '@db/entities';

export class ProductDto {
	constructor(product: ProductEntity) {
		this.id = product.id;
		this.name = product.name;
		this.description = product.description;
		this.priceInCentsUSD = product.priceInCentsUSD;
		this.category = product.category;
		this.productValue = product.productValue;
		this.imageURL = product.imageURL;
		this.createdAt = product.createdAt;
		this.isBest = product.isBest;
		this.bulletPoints = product.bulletPoints;
		this.metadata = product.metadata;
	}

	@ApiProperty({
		type: Number,
		description: 'Product id',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		description: 'Product name',
		example: 'Premium plan',
	})
	name: string;

	@ApiProperty({
		type: String,
		description: 'Product category',
		example: 'chatbot',
	})
	category: string;

	@ApiProperty({
		type: String,
		description: 'Product description',
		example: 'Premium plan includes all features: ...',
	})
	description: string;

	@ApiProperty({
		type: Number,
		description: 'Product price in USD',
		example: 4999,
	})
	priceInCentsUSD: number;

	@ApiProperty({
		type: String,
		description: 'Product image',
		example: 'https://example.com/image.png',
	})
	imageURL: string;

	@ApiProperty({
		type: Number,
		description: 'Product value',
		example: 100,
	})
	productValue: number;

	@ApiProperty({
		type: Boolean,
		description: 'Is product best',
		example: true,
	})
	isBest: boolean;

	@ApiProperty({
		type: [String],
		description: 'Product bulletpoints',
		example: ['Bulletpoint 1', 'Bulletpoint 2'],
	})
	bulletPoints: string[];

	@ApiProperty({
		type: Object,
		description: 'Product metadata',
		example: {
			maxBotsAllowedToCreate: 1,
			requestsPerMonth: 1000,
			maxSnippetsAllowedToCreate: 100,
		},
	})
	metadata: object;

	@ApiProperty({
		type: Date,
		description: 'Product creation date',
		example: '2021-01-01T00:00:00.000Z',
	})
	createdAt: Date;
}
