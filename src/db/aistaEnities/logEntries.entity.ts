import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'log_entries' })
export class LogEntry {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
	})
	created: Date;

	@Column({ type: 'varchar', length: 10 })
	type: string;

	@Column({ type: 'text' })
	content: string;

	@Column({ type: 'text', nullable: true })
	exception: string;

	@Column({ type: 'text', nullable: true })
	meta: string;
}
