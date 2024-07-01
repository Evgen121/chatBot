import { EmailTracking } from '@/src/db/entities';
import { ErrorMessages } from '@/src/utils/errors/errors';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Raw, Repository } from 'typeorm';

@Injectable()
export class TrackingService {
	constructor(
		@InjectRepository(EmailTracking)
		private readonly emailTrackingRepository: Repository<EmailTracking>
	) {}

	async allTracking(
		query: any
	): Promise<{ total: number; data: EmailTracking[] }> {
		try {
			const { filter, sort, limit, page } = query;
			const whereCondition = {};

			for (const key in filter) {
				if (filter.hasOwnProperty(key)) {
					const filterValue = filter[key]?.split('||');
					const filterKey = filterValue && filterValue[0];
					const filterData =
						filterValue && decodeURI(filterValue[2]).toLowerCase();

					if (filterKey === 'createdAt' && filterData) {
						whereCondition[filterKey] = Raw(
							(alias) =>
								`TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterData}%'`
						);
					} else {
						if (filterKey) {
							whereCondition[filterKey] = ILike(`%${filterData}%`);
						}
					}
				}
			}

			const order = sort && sort[0]?.split(',');
			const take = limit || 10;
			const skip = page ? (page - 1) * take : 0;

			const [trackings, total] = await Promise.all([
				this.emailTrackingRepository.find({
					where: whereCondition,
					order: order ? { [order[0]]: order[1] } : {},
					take,
					skip,
				}),
				this.emailTrackingRepository.count({
					where: whereCondition,
				}),
			]);

			return { data: trackings, total };
		} catch (error) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
	}

	async deleteTracking(id: string): Promise<EmailTracking | null> {
		const tracking = await this.emailTrackingRepository.findOne({
			where: { id },
		});
		if (!tracking) {
			return null;
		}
		await this.emailTrackingRepository.delete(id);
		return tracking;
	}
}
