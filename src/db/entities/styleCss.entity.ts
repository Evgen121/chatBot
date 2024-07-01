import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	OneToMany,
	ManyToOne,
} from 'typeorm';
import { ChatBotEntity } from './chatBot.entity';
import { StructureEntity } from './structure.entity';

@Entity({
	name: 'CssStyle',
})
export class CssStyleEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ nullable: false, unique: false })
	name: string;

	@Column({ nullable: true, unique: true })
	cssName: string;

	@Column({ nullable: false })
	properties: string;

	@Column({
		unique: false,
		nullable: true,
		type: 'varchar',
		length: 255,
		default:
			'	https://chatbot-generator-dev.coderfy.com/static/media/default.5e24020eadb5a1a31d9d.png',
	})
	imageUrl: string;

	@ManyToOne(() => StructureEntity, (structure) => structure.styleCss, {
		onDelete: 'SET NULL',
		onUpdate: 'CASCADE',
	})
	structure: StructureEntity;

	@OneToMany(() => ChatBotEntity, (chatBot) => chatBot.structure, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE',
	})
	chatBots: ChatBotEntity[];
}
