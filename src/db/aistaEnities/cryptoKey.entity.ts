import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'crypto_keys' })
export class CryptoKey {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 120, nullable: false })
	subject: string;

	@Column({ type: 'varchar', length: 120, nullable: false })
	email: string;

	@Column({ type: 'varchar', length: 250, nullable: true })
	domain: string | null;

	@Column({ type: 'varchar', length: 20, nullable: false })
	type: string;

	@Column({ type: 'varchar', length: 120, nullable: false })
	fingerprint: string;

	@Column({ type: 'text', nullable: false })
	content: string;

	@Column({ type: 'text', nullable: false })
	vocabulary: string;

	@Column({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		nullable: false,
	})
	imported: Date;

	@Column({ type: 'boolean', default: false, nullable: false })
	enabled: boolean;
}
