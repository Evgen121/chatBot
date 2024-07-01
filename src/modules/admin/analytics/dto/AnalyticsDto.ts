import { ChatBotEntity } from '@/src/db/entities';
import { ChatBotDto } from '@modules/chatBot/dto/ChatbotDto';

export class AnalyticsDto {
	constructor(
		chatbot: ChatBotEntity,
		requests: number,
		scriptRequests: number
	) {
		this.id = chatbot.id;
		this.chatbot = new ChatBotDto(chatbot);
		this.requests = requests;
		this.scriptRequests = scriptRequests;
	}
	id: number;
	chatbot: ChatBotDto;
	requests: number;
	scriptRequests: number;
}
