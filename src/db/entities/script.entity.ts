import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatBotEntity } from './chatBot.entity';

@Entity({
	name: 'Script',
})
export class ScriptEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@Column({ nullable: false, type: 'text' })
	code: string;

	@OneToMany(() => ChatBotEntity, (chatBot) => chatBot.script, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	chatBots: ChatBotEntity[];
}
