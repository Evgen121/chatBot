import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ContentEntity } from './content.entity';
import { UserEntity } from './user.entity';

@Entity({
	name: 'Subject',
})
export class SubjectEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: false, nullable: false, type: 'varchar' })
	name: string;

	@Column({
		nullable: false,
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	createDate: Date;

	@OneToMany(() => ContentEntity, (content) => content.subject)
	contents: ContentEntity[];

	@ManyToOne(() => UserEntity, (user) => user.id, { cascade: true })
	user: UserEntity;
}
