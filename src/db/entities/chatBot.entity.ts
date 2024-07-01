import {
	Column,
	Entity,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { CssStyleEntity, LeadsEntity, StructureEntity, UserEntity } from '.';
import { MLTrainingSnippet, MLRequest } from '../aistaEnities';
import { ScriptEntity } from './script.entity';

const defaultFooter =
	'<div style="font-size:12px; color:rgb(128,128,128); display:flex; justify-content: center; align-items: center; ">2023 © Powered by <a href="https://www.coderfy.com/" style="text-decoration:none; margin-left:5px;" target="_blank" rel="noopener noreferrer">Coderfy</a></div>';

@Entity({
	name: 'ChatBot',
})
export class ChatBotEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	creationDate: Date;

	@Column({
		nullable: false,
		type: 'date',
		default: () => `Date(NOW() + INTERVAL '7 days')`,
	})
	expiryDate: Date;

	@Column({
		nullable: true,
		default: defaultFooter,
	})
	footer: string;

	@ManyToOne(() => UserEntity, (user) => user.id, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	user: UserEntity;

	@Column({ nullable: true, default: '' })
	tone: string;

	@Column({ nullable: true, default: '10' })
	max: number;

	@Column({ unique: true, nullable: true, default: '' })
	domain: string;

	@Column({ nullable: true, default: 'Custom ChatGPT Chatbot' })
	button: string;

	@Column({ nullable: true, default: '' })
	model: string;

	@Column({
		type: 'boolean',
		nullable: false,
		default: true,
	})
	includeInAnalytics: boolean;

	@Column({
		nullable: false,
		type: 'boolean',
		default: true,
	})
	isActive: boolean;

	@Column({
		unique: false,
		nullable: true,
		type: 'varchar',
		length: 255,
		default: 'https://api.coderfy.com/static/static/Logo.png',
	})
	imageUrl: string;

	@Column({ nullable: true, default: 'Ask me about business' })
	askMe: string;

	@Column({ unique: true, nullable: true, default: '' })
	name: string;

	@Column({
		unique: false,
		nullable: true,
		type: 'varchar',
		length: 255,
		default: 'ChatBot',
	})
	chatBotName: string;

	@Column({ nullable: false, default: false, type: 'boolean' })
	isVectorized: boolean;

	@Column({ nullable: false, default: false, type: 'boolean' })
	autocrawl: boolean;

	@Column({ nullable: true, default: 'Chess' })
	style: string;

	@Column({ nullable: true, default: true })
	markdown: boolean;

	@Column({ nullable: true, default: false })
	speech: boolean;

	@Column({ nullable: true, default: false })
	search: boolean;

	@Column({ nullable: true, default: true })
	chat: boolean;

	@Column({ nullable: true, default: false })
	rtl: boolean;

	@Column({ nullable: true, default: '' })
	header: string;

	@OneToMany(() => LeadsEntity, (lead) => lead.id, {
		nullable: true,
		onDelete: 'NO ACTION',
		onUpdate: 'NO ACTION',
	})
	leads: LeadsEntity[];

	mlType: MLTrainingSnippet[];

	MlSnippet: MLTrainingSnippet[];

	MLRequest: MLRequest[];

	@ManyToOne(() => ScriptEntity, (script) => script.id, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	script: ScriptEntity;

	@ManyToOne(() => StructureEntity, (structure) => structure.id, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	structure: StructureEntity;

	@ManyToOne(() => CssStyleEntity, (styleCss) => styleCss.id, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	styleCss: CssStyleEntity;
}
