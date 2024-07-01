import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity({ name: 'users_roles' })
export class UserRole {
	@PrimaryColumn({ type: 'varchar', length: 45 })
	role: string;

	@PrimaryColumn({ name: 'user', type: 'varchar', length: 256 })
	user: string;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'user', referencedColumnName: 'username' })
	userObject: User;

	@ManyToOne(() => Role, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'role', referencedColumnName: 'name' })
	roleObject: Role;
}
