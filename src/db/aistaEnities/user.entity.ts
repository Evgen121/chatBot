import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
	@PrimaryColumn({ type: 'varchar', length: 256 })
	username: string;

	@Column({ type: 'varchar', length: 256 })
	password: string;

	@Column({ type: 'boolean', default: false })
	locked: boolean;

	@CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
	created: Date;
}
