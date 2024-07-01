import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsOptional,
	IsNumber,
	IsBoolean,
	IsObject,
} from 'class-validator';

export class UpdateProductDto {
	@ApiProperty({
		type: String,
		description: 'Product name',
		example: 'Premium plan',
	})
	@IsString()
	@IsOptional()
	name: string;

	@ApiProperty({
		type: String,
		description: 'Product description',
		example: 'Premium plan includes all features: ...',
	})
	@IsString()
	@IsOptional()
	description: string;

	@ApiProperty({
		type: String,
		description: 'Product category',
		example: 'chatbot',
	})
	@IsString()
	@IsOptional()
	category: string;

	@ApiProperty({
		type: Number,
		description: 'Product value',
		example: 100,
	})
	@IsNumber()
	@IsOptional()
	productValue: number;

	@ApiProperty({
		type: Number,
		description: 'Product price in USD',
		example: 4999,
	})
	@IsOptional()
	@IsNumber()
	priceInCentsUSD: number;

	@ApiProperty({
		type: String,
		description: 'Product image',
		example: 'https://example.com/image.png',
	})
	@IsString()
	@IsOptional()
	imageURL: string;

	@ApiProperty({
		type: Boolean,
		description: 'Product is best',
		example: true,
	})
	@IsOptional()
	@IsBoolean()
	isBest: boolean;

	@ApiProperty({
		type: [String],
		description: 'Product bulletpoints',
		example: ['Bulletpoint 1', 'Bulletpoint 2'],
	})
	@IsString({ each: true })
	@IsOptional()
	bulletPoints: string[];

	@ApiProperty({
		type: Object,
		description: 'Product metadata',
		example: { test: 'test', test2: 'test2' },
	})
	@IsOptional()
	@IsObject()
	metadata: object;
}
