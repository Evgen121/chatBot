import { ApiProperty } from '@nestjs/swagger';
import {
	IsString,
	IsNumber,
	IsUrl,
	IsNotEmpty,
	IsBoolean,
	IsOptional,
} from 'class-validator';

export class CreateProductDto {
	@ApiProperty({
		type: String,
		description: 'Product name',
		example: 'Premium plan',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		type: String,
		description: 'Product description',
		example: 'Premium plan includes all features: ...',
	})
	@IsString()
	@IsNotEmpty()
	description: string;

	@ApiProperty({
		type: String,
		description: 'Product category',
		example: 'chatbot',
	})
	@IsString()
	@IsNotEmpty()
	category: string;

	@ApiProperty({
		type: Number,
		description: 'Product value',
		example: 100,
	})
	@IsNumber()
	productValue: number;

	@ApiProperty({
		type: Number,
		description: 'Product price in cents USD',
		example: 4999,
	})
	@IsNumber()
	@IsNotEmpty()
	priceInCentsUSD: number;

	@ApiProperty({
		type: String,
		description: 'Product image',
		example: 'https://example.com/image.png',
	})
	@IsUrl()
	@IsNotEmpty()
	imageURL: string;

	@ApiProperty({
		type: Boolean,
		description: 'Is product best',
		example: false,
	})
	@IsBoolean()
	isBest: boolean;

	@ApiProperty({
		type: [String],
		description: 'Product bulletpoints',
		example: ['Bulletpoint 1', 'Bulletpoint 2'],
	})
	@IsString({ each: true })
	@IsOptional({ each: true })
	@IsNotEmpty({ each: true })
	bulletPoints: string[];

	@ApiProperty({
		type: Object,
		description: 'Product metadata',
		example: { test: 'test', test2: 'test2' },
	})
	@IsOptional()
	metadata: object;
}
