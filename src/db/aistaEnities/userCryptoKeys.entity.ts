import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { CryptoKey } from './cryptoKey.entity';

@Entity({ name: 'users_crypto_keys' })
export class UserCryptoKey {
	@PrimaryColumn({ type: 'integer', nullable: false })
	key_id: number;

	@Column({ type: 'varchar', length: 256, nullable: false })
	username: string;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'username', referencedColumnName: 'username' })
	user: User;

	@ManyToOne(() => CryptoKey, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'key_id', referencedColumnName: 'id' })
	cryptoKey: CryptoKey;
}
