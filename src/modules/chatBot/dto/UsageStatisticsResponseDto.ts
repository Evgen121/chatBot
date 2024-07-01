import { ApiProperty } from '@nestjs/swagger';

export class UsageStatisticsResponseDto {
	@ApiProperty({
		type: String,
		example: 'sub_1J5X2n2eZvKYlo2C0QZ2QZ2QZ',
	})
	subscriptionId: string;

	@ApiProperty({
		type: Date,
		example: '2021-07-01',
	})
	subscriptionDueDate: Date;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	requestsCount: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	requestsPerMonth: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	snippetsCount: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	snippetsAvailable: number;

	@ApiProperty({
		type: Date,
		example: '2021-07-01',
	})
	snippetsDeletionDate: Date;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	contenterPoints: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	maxBotsAllowedToCreate: number;

	@ApiProperty({
		type: Number,
		example: 1,
	})
	botsCount: number;
}
