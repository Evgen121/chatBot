import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { ChatBotEntity } from './chatBot.entity';

@Entity({ name: 'MessengerBot' })
export class MessengerBotEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@CreateDateColumn()
	createdAt: Date;

	@Column({
		type: 'varchar',
		length: 255,
		nullable: false,
		unique: true,
	})
	botToken: string;

	@Column({
		type: 'varchar',
		length: 255,
		enum: ['telegram', 'viber', 'whatsup'],
		nullable: false,
	})
	messenger: string;

	@Column({
		type: 'boolean',
		default: false,
	})
	isActive: boolean;

	@ManyToOne(() => ChatBotEntity, (chatbot) => chatbot.id, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	chatbot: ChatBotEntity;

	@ManyToOne(() => UserEntity, (user) => user.id, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	user: UserEntity;
}
