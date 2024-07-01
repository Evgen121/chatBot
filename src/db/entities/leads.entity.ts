import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	OneToMany,
	JoinColumn,
} from 'typeorm';
import { ChatBotEntity } from './chatBot.entity';
import { UserEntity } from './user.entity';
import { InstructionUrlEntity } from './instructionUrl.entity';

@Entity({
	name: 'Leads',
})
export class LeadsEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: true, unique: true })
	email: string;

	@Column({ nullable: true })
	emailStatus: string;

	@Column({
		nullable: false,
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	registerDate: Date;

	@Column({ nullable: true })
	firstName: string;

	@Column({ nullable: true })
	lastName: string;

	@Column({ nullable: true })
	fullName: string;

	@Column({ nullable: true })
	userSocial: string;

	@Column({ nullable: true })
	jobPosition: string;

	@Column({ nullable: true })
	country: string;

	@Column({ nullable: true })
	location: string;

	@Column({ nullable: true })
	industry: string;

	@Column({ nullable: true })
	addDate: Date;

	@Column({ nullable: true })
	companyName: string;

	@Column({ nullable: true })
	companyURL: string;

	@Column({ nullable: true })
	companySocial: string;

	@Column({ nullable: true })
	companySize: string;

	@Column({ nullable: true, type: 'boolean', default: false })
	processed: boolean;

	@Column({ nullable: true })
	companysCountry: string;

	@Column({ nullable: true })
	companyLocation: string;

	@Column({ nullable: true })
	state: string;

	@Column({ nullable: true })
	city: string;

	@Column({ nullable: true })
	language: string;

	@Column({ nullable: true })
	companyIndustry: string;

	@Column({ nullable: true })
	hQPhone: string;

	@OneToMany(
		() => InstructionUrlEntity,
		(instructionUrl) => instructionUrl.lead,
		{ cascade: true }
	)
	@JoinColumn()
	instructionUrls: InstructionUrlEntity[];

	@OneToMany(() => UserEntity, (user) => user.lead, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	user: UserEntity;

	@ManyToOne(() => ChatBotEntity, (chatbot) => chatbot.id, { nullable: true })
	chatbot: ChatBotEntity;
}
