import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { CryptoKey } from './cryptoKey.entity';

@Entity({ name: 'crypto_invocations' })
export class CryptoInvocation {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'integer', nullable: false })
	crypto_key: number;

	@Column({ type: 'varchar', length: 250, nullable: false, unique: true })
	request_id: string;

	@Column({ type: 'text', nullable: false })
	request: string;

	@Column({ type: 'text', nullable: false })
	request_raw: string;

	@Column({ type: 'text', nullable: false })
	response: string;

	@Column({
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
		nullable: false,
	})
	created: Date;

	@ManyToOne(() => CryptoKey, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'crypto_key', referencedColumnName: 'id' })
	cryptoKeyObject: CryptoKey;
}
