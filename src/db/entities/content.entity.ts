import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ImageEntity, SubjectEntity, UserEntity } from '.';
import { OptionalTitleEntity } from './optionalTitle.entity';

@Entity({
	name: 'Content',
})
export class ContentEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ unique: false, nullable: true, type: 'text', default: '' })
	keywords: string;

	@Column({ unique: false, nullable: false, type: 'varchar', default: '' })
	textType: string;

	@Column({ unique: false, nullable: true, type: 'int', default: 0 })
	size: number;

	@Column({ unique: false, nullable: false, type: 'varchar', default: '' })
	topic: string;

	@Column({
		nullable: false,
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	creationDate: Date;

	@Column({ unique: false, nullable: false, type: 'text', default: '' })
	text: string;

	@OneToMany(
		() => OptionalTitleEntity,
		(optionalTitle) => optionalTitle.content
	)
	optionalTitles: OptionalTitleEntity[];

	@ManyToOne(() => UserEntity, (user) => user.id, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: UserEntity;

	@ManyToOne(() => SubjectEntity, (subject) => subject.contents, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	subject: SubjectEntity;

	@OneToMany(() => ImageEntity, (image) => image.content, { cascade: true })
	@JoinColumn({ name: 'contentId' })
	images: ImageEntity[];
}
