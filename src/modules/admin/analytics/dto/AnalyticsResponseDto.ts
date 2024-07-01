import { AnalyticsDto } from './AnalyticsDto';

export class AnalitycsResponseDto {
	constructor(analyticsList: AnalyticsDto[], total: number) {
		this.data = analyticsList;
		this.total = total;
	}

	data: AnalyticsDto[];

	total: number;
}
