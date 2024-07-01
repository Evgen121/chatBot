import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ContentEntity } from './content.entity';

@Entity({
	name: 'OptionalTitle',
})
export class OptionalTitleEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, default: '' })
	title: string;

	@Column({ nullable: false, default: '' })
	text: string;

	@Column({ nullable: true, default: 40, type: 'int' })
	size: number;

	@ManyToOne(() => ContentEntity, (content) => content.id, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	content: ContentEntity;
}
