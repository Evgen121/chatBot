import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InstructionUrlEntity, LeadsEntity } from '@db/entities';
import { ILike, Raw, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DocsService } from '../shared/services/docs.service';
import { ErrorMessages } from '@utils/errors/errors';

@Injectable()
export class LeadsService {
	private logger: Logger;
	constructor(
		private readonly docsService: DocsService,
		@InjectRepository(LeadsEntity)
		private readonly leadsRepository: Repository<LeadsEntity>
	) {
		this.logger = new Logger(LeadsService.name);
	}

	async importLeads(file: Express.Multer.File): Promise<void> {
		try {
			let data;
			if (file.originalname.includes('.csv')) {
				const records = await this.docsService.parseCSVWithComa(file);
				data = await this.docsService.saveFromCSVorXLSX(records);
			} else {
				const records = await this.docsService.parseXLSX(file);
				data = await this.docsService.saveFromCSVorXLSX(records);
			}

			for (const item of data) {
				const isEmailValid = item.email && item.email.trim() !== '';
				const isCompanyURLValid =
					item.companyURL && item.companyURL.trim() !== '';

				if (isEmailValid || isCompanyURLValid) {
					if (isCompanyURLValid) {
						item.companyURL = item.companyURL
							.replace(/^https?:\/\//, '')
							.toLowerCase();
					}

					Object.keys(item).forEach((key) => {
						if (item[key] === '') {
							item[key] = null;
						}
					});

					try {
						await this.leadsRepository.save(item);
					} catch (e) {
						this.logger.error(e);
					}
				}
			}
		} catch (e) {
			this.logger.error(e);
			throw new ConflictException(ErrorMessages.user.DUBLICATE_LEAD);
		}
	}

	async exportLeads(type: 'csv' | 'xlsx'): Promise<string> {
		const leads = await this.leadsRepository.find();

		return type === 'csv'
			? await this.docsService.buildCSV(leads)
			: await this.docsService.buildXLSX(leads);
	}

	async getAllLeads(
		query: any
	): Promise<{ data: LeadsEntity[]; total: number }> {
		const filter = query?.filter || {};
		const whereCondition = {};

		const page = query.page || 1;
		const limit = query.limit || 10;
		const skip = (page - 1) * limit;

		for (const key in filter) {
			if (filter?.hasOwnProperty(key)) {
				const filterValue = query.filter[key]?.split('||');
				const filterField = filterValue && filterValue[0];

				const filterQuery =
					filterValue && decodeURI(filterValue[2]).toLowerCase();

				if (filterField === 'registerDate' && filterQuery) {
					whereCondition[filterField] = Raw(
						(alias) =>
							`TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterQuery}%'`
					);
				} else {
					whereCondition[filterField] = ILike(`%${filterQuery}%`);
				}
			}
		}

		const [key, order] = query.sort
			? query.sort[0]?.split(',')
			: ['registerDate', 'ASC'];

		const leadsWithUrls = await this.leadsRepository.find({
			where: whereCondition,
			order: { [key]: order },
			skip,
			take: limit,
			relations: ['instructionUrls'],
		});

		const leads = leadsWithUrls.map((lead) => {
			const { instructionUrls, ...rest } = lead;
			const urls = instructionUrls.map((urlEntity) => urlEntity.instructionUrl);
			return {
				...rest,
				instructionUrls: urls as unknown as InstructionUrlEntity[],
			};
		});

		const total = await this.leadsRepository.count({ where: whereCondition });

		return { data: leads, total };
	}

	async getLeadById(id: number): Promise<LeadsEntity | null> {
		return this.leadsRepository.findOne({ where: { id: id } });
	}

	async deleteLeadById(id: number): Promise<LeadsEntity | null> {
		const leadToDelete = await this.leadsRepository.findOne({
			where: { id: id },
			relations: ['instructionUrls'],
		});
		if (!leadToDelete) {
			return null;
		}
		await this.leadsRepository.delete(id);
		return leadToDelete;
	}
}
