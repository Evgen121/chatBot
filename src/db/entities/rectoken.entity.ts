import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'Rectokens' })
export class RectokenEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	masked_card: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	card_type: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	recToken: string;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
	})
	rectoken_lifetime: string;

	@ManyToOne(() => UserEntity, (user) => user.id, { cascade: true })
	user: UserEntity;
}
