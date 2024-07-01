import { MessengerBotEntity } from '@db/entities';
import { MessengerBotDto } from './MessengerBotDto';

export class MessengerBotResponseDto {
	constructor(messengerBots: MessengerBotEntity[], count: number) {
		this.result = messengerBots.map((bot) => new MessengerBotDto(bot));
		this.count = count;
	}

	result: MessengerBotDto[];

	count: number;
}
