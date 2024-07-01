import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
	name: 'Feedback',
})
export class FeedbackEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true, type: 'varchar', length: 255, default: '' })
	name: string;

	@Column({ nullable: true, type: 'varchar', length: 255, default: '' })
	email: string;

	@Column({ nullable: false, type: 'text', default: '' })
	subject: string;

	@Column({ nullable: false, type: 'text', default: '' })
	message: string;

	@CreateDateColumn({})
	creationDate: Date;
}
