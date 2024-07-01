import {
	Column,
	Entity,
	ManyToOne,
	PrimaryColumn,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { RectokenEntity } from './rectoken.entity';
import { ProductEntity } from './product.entity';

@Entity({ name: 'Payments' })
export class PaymentEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@PrimaryColumn({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	order_id: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	order_time: string;

	@Column({
		type: 'bigint',
		nullable: false,
	})
	payment_id: number;

	@Column({
		nullable: false,
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createdAt: Date;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	masked_card: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	order_status: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	card_type: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	amount: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	actual_amount: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	currency: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	actual_currency: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: true,
	})
	merchant_data: string;

	@ManyToOne(() => UserEntity, (user) => user.id, { cascade: true })
	user: UserEntity;

	@ManyToOne(() => ProductEntity, (product) => product.id, { cascade: true })
	product: ProductEntity;

	@ManyToOne(() => RectokenEntity, (rectoken) => rectoken.id, { cascade: true })
	rectoken: RectokenEntity;
}
