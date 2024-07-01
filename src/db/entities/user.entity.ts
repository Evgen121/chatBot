import {
	Column,
	Entity,
	OneToMany,
	ManyToOne,
	PrimaryGeneratedColumn,
	OneToOne,
	ManyToMany,
} from 'typeorm';
import {
	ChatBotEntity,
	ContentEntity,
	RoleEntity,
	RectokenEntity,
	SubjectEntity,
	LeadsEntity,
	PromoCode,
} from '.';

@Entity({
	name: 'User',
})
export class UserEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		unique: false,
		nullable: false,
		type: 'varchar',
		length: 255,
		default: '',
	})
	username: string;

	@Column({
		unique: false,
		nullable: false,
		type: 'varchar',
		length: 255,
		default: '',
	})
	surname: string;

	@Column({
		unique: true,
		nullable: false,
		type: 'varchar',
		length: 255,
		default: '',
	})
	email: string;

	@Column({
		select: false,
		nullable: false,
		type: 'varchar',
		length: 255,
		default: '',
	})
	password: string;

	@Column({
		select: false,
		nullable: false,
		type: 'varchar',
		length: 255,
		default: '',
	})
	salt: string;

	@Column({ nullable: true })
	resetToken: string;

	@Column({
		nullable: false,
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP',
	})
	registerDate: Date;

	@Column({
		nullable: true,
		type: 'varchar',
		length: 255,
		default: null,
	})
	subscriptionId: string;

	@Column({
		nullable: true,
		type: 'date',
		default: null,
	})
	subscriptionDueDate: Date;

	@Column({
		nullable: false,
		type: 'int',
		default: 0,
	})
	requestsCount: number;

	@Column({
		nullable: false,
		type: 'int',
		default: 0,
	})
	snippetsCount: number;

	@Column({
		nullable: true,
		type: 'date',
		default: null,
	})
	snippetsDeletionDate: Date;

	@Column({
		nullable: false,
		type: 'boolean',
		default: false,
	})
	isBlocked: boolean;

	@Column({ nullable: false, type: 'boolean', default: false })
	isEmailConfirmed: boolean;

	@Column({ nullable: false, type: 'boolean', default: false })
	firstVisit: boolean;

	@Column({ nullable: false, type: 'real', default: 80 })
	contenterPoints: number;

	@Column({ nullable: false, type: 'varchar', default: 'basic' })
	authProvider: string;

	@Column({
		select: false,
		nullable: true,
		type: 'varchar',
		length: 10,
		default: null,
	})
	emailConfirmCode: string;

	@OneToMany(() => ChatBotEntity, (chatBot) => chatBot.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	chatBots: ChatBotEntity[];

	@ManyToOne(() => LeadsEntity, (lead) => lead.user, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	lead: LeadsEntity;

	@OneToMany(() => ContentEntity, (content) => content.user, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	content: ContentEntity[];

	@ManyToOne(() => RectokenEntity, (recToken) => recToken.user, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	defaultRectoken: RectokenEntity;

	@OneToMany(() => RectokenEntity, (recToken) => recToken.user, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	recTokens: RectokenEntity[];

	@ManyToOne(() => RoleEntity, (role) => role.users, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	role: RoleEntity;

	@OneToMany(() => SubjectEntity, (subject) => subject.id)
	subjects: SubjectEntity[];

	@Column({
		nullable: true,
		type: 'timestamp',
		default: null,
	})
	lastLoginDate: Date;

	@ManyToMany(() => PromoCode, (promocode) => promocode.users, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	promocodes: PromoCode[];
}
