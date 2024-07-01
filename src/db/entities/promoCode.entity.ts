import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToMany,
	JoinTable,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({
	name: 'PromoCode',
})
export class PromoCode {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
		type: 'int',
		default: 0,
	})
	discount: number;

	@Column({
		nullable: false,
		unique: true,
	})
	promoCode: string;

	@ManyToMany(() => UserEntity, (user) => user.promocodes, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	@JoinTable()
	users: UserEntity[];
}
