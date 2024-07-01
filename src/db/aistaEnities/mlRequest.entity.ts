import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { MLType } from './mlType.entity';

@Entity({ name: 'ml_requests' })
export class MLRequest {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		nullable: false,
	})
	created: Date;

	@Column({ type: 'varchar', length: 256, nullable: false })
	type: string;

	@Column({ type: 'text', nullable: false })
	prompt: string;

	@Column({ type: 'text', nullable: false })
	completion: string;

	@Column({ type: 'varchar', length: 100, nullable: false })
	finish_reason: string;

	@Column({ type: 'smallint', nullable: true })
	cached: number | null;

	@Column({ type: 'text', nullable: true })
	session: string | null;

	@ManyToOne(() => MLType, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'type', referencedColumnName: 'type' })
	mlType: MLType;
}
