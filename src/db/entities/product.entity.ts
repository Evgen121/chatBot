import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'Products', database: 'postgres' })
export class ProductEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
		type: 'varchar',
		length: 255,
		default: '',
	})
	name: string;

	@Column({
		type: 'varchar',
		length: 1000,
		nullable: false,
		default: '',
	})
	description: string;

	@Column({
		type: 'int',
		nullable: false,
		default: 0,
	})
	productValue: number;

	@Column({
		type: 'json',
		nullable: false,
		default: '{}',
	})
	metadata: object;

	@Column({
		type: 'varchar',
		length: 500,
		nullable: false,
		default: 'chatbot',
	})
	category: string;

	@Column({
		type: 'int',
		nullable: false,
		default: 0,
	})
	priceInCentsUSD: number;

	@Column({
		type: 'boolean',
		nullable: false,
		default: false,
	})
	isBest: boolean;

	@Column({
		type: 'varchar',
		length: 500,
		nullable: true,
		default: '',
	})
	imageURL: string;

	@CreateDateColumn()
	createdAt: Date;

	@Column({
		type: 'varchar',
		length: 500,
		nullable: false,
		array: true,
		default: '{}',
	})
	bulletPoints: string[];
}
