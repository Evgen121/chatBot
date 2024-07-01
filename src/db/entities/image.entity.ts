import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { ContentEntity } from './content.entity';

@Entity()
export class ImageEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ type: 'text' })
	url: string;

	@ManyToOne(() => ContentEntity, (content) => content.images, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	@JoinColumn({ name: 'contentId' })
	content: ContentEntity;
}
