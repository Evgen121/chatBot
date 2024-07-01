import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ChatBotEntity } from './chatBot.entity';
import { CssStyleEntity } from './styleCss.entity';

@Entity({
	name: 'Structure',
})
export class StructureEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: true })
	name: string;

	@OneToMany(() => ChatBotEntity, (chatBot) => chatBot.structure, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	chatBots: ChatBotEntity[];

	@Column({
		unique: false,
		nullable: true,
		type: 'varchar',
		length: 255,
		default:
			'https://chatbot-generator-dev.coderfy.com/emailImages/logoCoderfy.png',
	})
	imageUrl: string;

	@OneToMany(() => CssStyleEntity, (styleCss) => styleCss.structure, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	styleCss: CssStyleEntity[];
}
