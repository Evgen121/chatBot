import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'tasks' })
export class Task {
	@PrimaryColumn({ type: 'varchar', length: 256 })
	id: string;

	@Column({ type: 'varchar', length: 1024, nullable: true })
	description: string;

	@Column({ type: 'text' })
	hyperlambda: string;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created: Date;
}
