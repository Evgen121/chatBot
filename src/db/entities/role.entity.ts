import { Column, Entity, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({
	name: 'Role',
})
export class RoleEntity {
	@Column({ primary: true, type: 'int' })
	id: number;

	@Column({
		unique: true,
		default: 'user',
	})
	name: string;

	@Column({ nullable: true, type: 'varchar', length: 1000 })
	description: string;

	@OneToMany(() => UserEntity, (user) => user.role, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	users: UserEntity[];
}
