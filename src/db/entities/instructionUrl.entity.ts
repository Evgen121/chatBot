import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LeadsEntity } from './leads.entity';

@Entity()
export class InstructionUrlEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true })
	instructionUrl: string;

	@ManyToOne(() => LeadsEntity, (lead) => lead.instructionUrls, {
		onDelete: 'CASCADE',
	})
	lead: LeadsEntity;
}
