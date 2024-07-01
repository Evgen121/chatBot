import { MessengerBotEntity } from '@db/entities';

export class MessengerBotDto {
	constructor(messengerBot: MessengerBotEntity) {
		this.id = messengerBot.id;
		this.botToken = messengerBot.botToken;
		this.chatbotId = messengerBot.chatbot.id;
		this.userId = messengerBot.user.id;
		this.messenger = messengerBot.messenger;
	}

	id: number;

	botToken: string;

	messenger: string;

	chatbotId: number;

	userId: number;
}
