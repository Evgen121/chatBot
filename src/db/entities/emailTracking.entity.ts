import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
} from 'typeorm';

@Entity()
export class EmailTracking {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ default: false })
	opened: boolean;

	@Column()
	email: string;

	@Column()
	username: string;

	@CreateDateColumn()
	createdAt: Date;
}
