import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { MLType } from './mlType.entity';

@Entity({ name: 'ml_training_snippets' })
export class MLTrainingSnippet {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		nullable: false,
	})
	created: Date;

	@Column({ type: 'varchar', length: 256, default: 'hl', nullable: false })
	type: string;

	@Column({ type: 'smallint', default: 0, nullable: false })
	pushed: number;

	@Column({ type: 'varchar', length: 1024, nullable: true })
	uri: string | null;

	@Column({ type: 'text', nullable: false })
	prompt: string;

	@Column({ type: 'text', nullable: false })
	completion: string;

	@Column({ type: 'text', nullable: true })
	embedding: string | null;

	@Column({ type: 'varchar', length: 1024, nullable: true })
	filename: string | null;

	@Column({ type: 'integer', nullable: true })
	cached: number | null;

	@Column({ type: 'text', nullable: true })
	embedding_vss: string | null;

	@ManyToOne(() => MLType, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'type', referencedColumnName: 'type' })
	mlType: MLType;
}
