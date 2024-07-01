import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'EmailTemplate' })
export class EmailTemplateEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	name: string;

	@Column({
		type: 'varchar',
		length: 400,
		nullable: false,
		default: 'no-reply',
	})
	subject: string;

	@Column({
		name: 'template',
		type: 'text',
	})
	template: string;
}
