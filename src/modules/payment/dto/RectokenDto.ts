import { ApiProperty } from '@nestjs/swagger';
import { RectokenEntity } from '@db/entities/rectoken.entity';

export class RectokenDto {
	constructor(rectoken: RectokenEntity) {
		this.id = rectoken.id;
		this.masked_card = rectoken.masked_card;
		this.card_type = rectoken.card_type;
		this.rectoken = rectoken?.recToken;
		this.rectoken_lifetime = rectoken.rectoken_lifetime;
		this.userId = rectoken?.user?.id;
	}

	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		example: '444455XXXXXX1111',
	})
	masked_card: string;

	@ApiProperty({
		type: String,
		example: 'VISA',
	})
	card_type: string;

	@ApiProperty({
		type: String,
		example: 'f482d047d16238e52a0e0e3d3b2276ae63233e99',
	})
	rectoken: string;

	@ApiProperty({
		type: String,
		example: '01.12.2032 00:00:00',
	})
	rectoken_lifetime: string;

	@ApiProperty({
		type: Number,
		example: 1,
		description: 'User that owns the rectoken',
	})
	userId: number;
}
