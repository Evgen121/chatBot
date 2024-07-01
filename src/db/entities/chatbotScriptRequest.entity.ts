import {
	Column,
	CreateDateColumn,
	Entity,
	PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'ChatbotScriptRequest' })
export class ChatbotScriptRequestEntity {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		type: 'int',
	})
	chatBotId: number;

	@CreateDateColumn()
	requestDate: Date;
}
