import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { ContentEntity, OptionalTitleEntity, UserEntity } from '@db/entities';
import { ErrorMessages } from '@utils/errors/errors';
import { CreateOptionalTitleDto } from '@modules/content/dto/createOptionalTitleDto';
import { CreateContentDto } from '@modules/content/dto/createContentDto';
import { OpenAiService } from '@modules/shared/services/openAi.service';
import { ILike, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminContentService {
	private logger: Logger;

	constructor(
		@InjectRepository(ContentEntity)
		private readonly contentRepository: Repository<ContentEntity>,
		private readonly openAiService: OpenAiService,
		@InjectRepository(OptionalTitleEntity)
		private readonly optionalTitleRepository: Repository<OptionalTitleEntity>
	) {
		this.logger = new Logger(AdminContentService.name);
	}

	async generateContent(
		dto: CreateContentDto,
		user: UserEntity
	): Promise<ContentEntity> {
		const prompt = `Create a ${dto.textType} about ${dto.topic} in ${dto.size} words using this keywords '${dto.keywords}'.`;

		let text = await this.openAiService.getCompletion(prompt);
		text = text.replace(/^[\n ]+/, '');

		const contentEntity = await this.contentRepository.save({
			keywords: dto.keywords,
			topic: dto.topic,
			textType: dto.textType,
			size: dto.size,
			text,
			user,
		});
		const query = [];
		for (const optTitle of dto.optionalTitles) {
			query.push(
				this.generateOptionalTitle({
					contentID: contentEntity.id,
					optionalTitle: optTitle,
				})
			);
		}
		await Promise.all(query);

		return await this.contentRepository.findOne({
			where: { id: contentEntity.id },
			relations: ['optionalTitles'],
		});
	}

	async generateOptionalTitle(
		dto: CreateOptionalTitleDto
	): Promise<OptionalTitleEntity> {
		const parentContent = await this.contentRepository.findOne({
			where: { id: dto.contentID },
			relations: ['optionalTitles'],
		});
		if (!parentContent) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}

		const prompt = `Create a ${dto.optionalTitle} for this ${parentContent.textType}: ${parentContent.text}`;

		const text = await this.openAiService.getCompletion(prompt);

		const optionalTitle = await this.optionalTitleRepository.save({
			content: parentContent,
			text,
			title: dto.optionalTitle,
		});

		parentContent.optionalTitles.push(optionalTitle);

		await this.contentRepository.save({
			id: parentContent.id,
			optionalTitles: parentContent.optionalTitles,
		});

		delete optionalTitle.content;

		return optionalTitle;
	}

	async getContentById(id: string): Promise<ContentEntity> {
		const content = await this.contentRepository.findOne({
			where: { id },

			relations: ['user', 'optionalTitles'],
		});
		if (!content) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
		return content;
	}

	async getAllContentsByUserId(id: number): Promise<ContentEntity[]> {
		const contents = await this.contentRepository.find({
			where: { user: { id } },
			relations: ['optionalTitles'],
		});
		if (!contents) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
		return contents;
	}

	async deleteContentById(id: string) {
		const content = await this.contentRepository.findOne({ where: { id } });
		if (!content) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
		await this.contentRepository.delete({ id });
	}

	async getAllContent(
		query: any
	): Promise<{ data: ContentEntity[]; total: number }> {
		try {
			const filter = query.filter || {};
			const whereCondition = {};

			for (const key in filter) {
				if (filter.hasOwnProperty(key)) {
					const filterValue = query.filter[key]?.split('||');
					const filterField = filterValue && filterValue[0];

					const filterQuery =
						filterValue && decodeURI(filterValue[2]).toLowerCase();

					if (filterField === 'user.email' && filterQuery) {
						whereCondition['user'] = { email: ILike(`%${filterQuery}%`) };
					} else if (filterField === 'creationDate' && filterQuery) {
						whereCondition['creationDate'] = Raw(
							(alias) =>
								`TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterQuery}%'`
						);
					} else {
						whereCondition[filterField] = ILike(`%${filterQuery}%`);
					}
				}
			}

			const [key, order] = query.sort && query.sort[0]?.split(',');

			const queryQuilder = await this.contentRepository.createQueryBuilder(
				'content'
			);

			const [contents, total] = await queryQuilder
				.select([
					'content.id',
					'content.keywords',
					'content.textType',
					'content.size',
					'content.topic',
					'content.creationDate',
					'content.text',
					'content.user',
				])
				.leftJoinAndSelect('content.user', 'user')
				.where(whereCondition)
				.orderBy(
					order
						? { [key.includes('user') ? key : 'content.' + key]: order }
						: {}
				)
				.take(query.limit || 10)
				.skip(query.page ? (query.page - 1) * query.limit : 0)
				.getManyAndCount();

			return { data: contents, total };
		} catch (error) {
			this.logger.error('Error retrieving chatbots:', error);
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
	}
}
