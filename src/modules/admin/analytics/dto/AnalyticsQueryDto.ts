export class AnalyticsQueryDto {
	bots: string;
	interval: string;

	name: string;
	page: number;
	limit: number;
	sortKey: string;
	order: string;
	from: Date;
	to: Date;

	static parse(query: any) {
		const queryDto = new AnalyticsQueryDto();
		queryDto.page = query.page;
		queryDto.limit = query.limit;
		for (const filter of query?.filter || []) {
			const splitFilter = filter.split('||');
			if (splitFilter.at(0) == 'bots') {
				queryDto.bots = splitFilter.at(-1);
			} else if (splitFilter.at(0) == 'interval') {
				queryDto.interval = splitFilter.at(-1);
			} else if (splitFilter.at(0) == 'chatbot.name') {
				queryDto.name = splitFilter.at(-1);
			}
		}

		if (queryDto.interval == 'day') {
			const today = new Date();
			queryDto.from = new Date(today.toDateString());
		} else if (queryDto.interval == 'month') {
			const lastMonth = new Date();
			lastMonth.setMonth(lastMonth.getMonth() - 1);
			queryDto.from = new Date(lastMonth.toDateString());
		} else if (queryDto.interval == 'year') {
			const lastYear = new Date();
			lastYear.setFullYear(lastYear.getFullYear() - 1);
			queryDto.from = new Date(lastYear.toDateString());
		}
		const to = new Date();
		to.setDate(to.getDate() + 2);
		queryDto.to = to;
		if (query?.sort) {
			queryDto.sortKey = query?.sort[0]?.split(',')?.at(0);
			queryDto.order = query?.sort[0]?.split(',')?.at(1);
		}

		return queryDto;
	}
}
