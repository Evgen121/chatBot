import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'roles' })
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ type: 'varchar', length: 45, unique: true, nullable: false })
	name: string;

	@Column({ type: 'varchar', length: 256, nullable: true })
	description: string | null;
}
