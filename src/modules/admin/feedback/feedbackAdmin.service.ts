import { Injectable, NotFoundException } from '@nestjs/common';
import { FeedbackEntity } from '@db/entities';
import { ErrorMessages } from '@utils/errors/errors';
import { ILike, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FeedbackService {
	constructor(
		@InjectRepository(FeedbackEntity)
		private readonly feedbackRepository: Repository<FeedbackEntity>
	) {}

	async getAllFeedbacks(
		query: any
	): Promise<{ total: number; data: FeedbackEntity[] }> {
		const { filter, sort, limit, page } = query;
		const whereCondition = {};

		for (const key in filter) {
			if (filter.hasOwnProperty(key)) {
				const filterValue = filter[key]?.split('||');
				const filterKey = filterValue && filterValue[0];
				const filterData =
					filterValue && decodeURI(filterValue[2]).toLowerCase();

				if (filterKey === 'creationDate' && filterData) {
					whereCondition[filterKey] = Raw(
						(alias) => `TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterData}%'`
					);
				} else {
					whereCondition[filterKey] = ILike(`%${filterData}%`);
				}
			}
		}

		const order = sort && sort[0]?.split(',');
		const take = limit || 10;
		const skip = page ? (page - 1) * take : 0;

		const [feedbacks, total] = await Promise.all([
			this.feedbackRepository.find({
				where: whereCondition,
				order: order ? { [order[0]]: order[1] } : {},
				take,
				skip,
			}),
			this.feedbackRepository.count({
				where: whereCondition,
			}),
		]);

		return { total, data: feedbacks };
	}

	async findOneById(id: number): Promise<FeedbackEntity> {
		const feedback = await this.feedbackRepository.findOne({
			where: { id: id },
		});
		if (!feedback) {
			throw new NotFoundException(ErrorMessages.feedback.FEEDBACK_NOT_FOUND);
		}
		return feedback;
	}
}
