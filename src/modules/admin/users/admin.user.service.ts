import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorMessages } from '@utils/errors/errors';
import { ChatBotEntity, ContentEntity, UserEntity } from '@db/entities';
import { ILike, Raw, Repository } from 'typeorm';
import { AistaService } from '@shared/services/aista.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AdminUserService {
	constructor(
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		@InjectRepository(ChatBotEntity)
		private readonly chatBotRepository: Repository<ChatBotEntity>,
		@InjectRepository(ContentEntity)
		private readonly contentRepository: Repository<ContentEntity>,

		private readonly aistaService: AistaService
	) {}

	async findOneByIdWithChatBots(id: number): Promise<UserEntity> {
		const user = await this.usersRepository.findOneBy({ id });
		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}

		const chatBots = await this.chatBotRepository.find({
			where: { user: { id: id } },
			relations: ['user'],
		});

		const content = await this.contentRepository.find({
			where: { user: { id: id } },
			relations: {
				user: true,
			},
		});
		return { ...user, chatBots, content };
	}

	async getAllUsers(
		query: any
	): Promise<{ data: UserEntity[]; total: number }> {
		try {
			const { filter, sort, limit, page } = query;
			const whereCondition = {};

			for (const key in filter) {
				if (filter.hasOwnProperty(key)) {
					const filterValue = filter[key]?.split('||');
					const filterKey = filterValue && filterValue[0];
					const filterData =
						filterValue && decodeURI(filterValue[2]).toLowerCase();

					if (filterKey === 'registerDate' && filterData) {
						whereCondition[filterKey] = Raw(
							(alias) =>
								`TO_CHAR(${alias}, 'YYYY-MM-DD') ILIKE '%${filterData}%'`
						);
					} else if (filterKey === 'role.id' && filterData) {
						whereCondition['role'] = { id: filterData };
						delete whereCondition[filterKey];
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

			const [users, total] = await Promise.all([
				this.usersRepository.find({
					where: whereCondition,
					order: order ? { [order[0]]: order[1] } : {},
					take,
					skip,
					relations: ['role'],
				}),
				this.usersRepository.count({
					where: whereCondition,
				}),
			]);

			return { data: users, total };
		} catch (error) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
	}

	async deleteUserAdmin(id: number): Promise<string> {
		try {
			const user = await this.usersRepository.findOne({
				where: { id },
				relations: {
					chatBots: true,
				},
			});

			if (user) {
				for (const chatbot of user.chatBots) {
					await this.aistaService.deleteAsset(chatbot.name);
					await this.chatBotRepository.delete({ id: chatbot.id });
				}

				await this.usersRepository.delete({ id });
			}

			return 'User deleted';
		} catch (error) {
			console.log(error);
		}
	}

	async updateUser(id: number, partial: Partial<UserEntity>) {
		delete partial.chatBots;
		delete partial.content;

		const dbUser = await this.usersRepository.findOne({
			where: { id },
			relations: ['role'],
		});

		if (dbUser.role.id == 2 && partial?.isBlocked) {
			partial.isBlocked = false;
		}

		const updatedUser = await this.usersRepository.update({ id }, partial);

		if (updatedUser.affected === 0) {
			throw new NotFoundException('User zero Fields');
		}

		return await this.usersRepository.findOne({ where: { id } });
	}
}
