import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { CreateContentDto } from '../dto/createContentDto';
import { ErrorMessages } from '@utils/errors/errors';
import {
	ContentEntity,
	OptionalTitleEntity,
	SubjectEntity,
	UserEntity,
} from '@db/entities';
import { OpenAiService } from '@shared/services/openAi.service';
import { CreateOptionalTitleDto } from '../dto/createOptionalTitleDto';
import { CreateHtmlContentDto } from '../dto/createHtmlContentDto';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { ContentConfigsEnumData } from '../enums/configs.enum';
import { createWithSubjectContentDto } from '../dto/createWithSubjectContentDto';
import { CreateSubjectContentDto } from '../dto/createSubjectContentDto';

@Injectable()
export class ContentService {
	constructor(
		private readonly openAiService: OpenAiService,

		@InjectRepository(OptionalTitleEntity)
		private readonly optionalTitleRepository: Repository<OptionalTitleEntity>,
		@InjectRepository(ContentEntity)
		private readonly contentRepository: Repository<ContentEntity>,
		@InjectRepository(UserEntity)
		private readonly usersRepository: Repository<UserEntity>,
		@InjectRepository(SubjectEntity)
		private readonly subjectRepository: Repository<SubjectEntity>
	) {}

	async generateContent(
		dto: CreateContentDto,
		user: UserEntity
	): Promise<ContentEntity> {
		const prompt = `Create a ${dto.topic} ${dto.textType} using these '${dto.keywords}' keywords. Always complete sentences`;
		let text = await this.openAiService.getCompletion(
			prompt,
			ContentConfigsEnumData[dto.size]
		);
		const subject = await this.subjectRepository.findOne({
			where: { id: dto.subject },
		});
		text = text.replace(/^[\n ]+/, '');
		let imageUrls: string[] | null = null;
		if (dto.images) {
			const MAX_TEXT_LENGTH = 900;

			const truncatedText =
				text.length > MAX_TEXT_LENGTH
					? text.substring(0, MAX_TEXT_LENGTH)
					: text;

			const imageResponse = await this.openAiService.generateImage(
				truncatedText,
				dto
			);
			imageUrls = imageResponse.urls;
		}
		const contentEntity = await this.contentRepository.save({
			keywords: dto.keywords,
			topic: dto.topic,
			textType: dto.textType,
			size: dto.size,
			text,
			user,
			subject,
			images: imageUrls ? imageUrls.map((url) => ({ url })) : null,
		});
		await this.takePointsFromUser(user.id, text.length);
		const promises = [];
		for (const optTitle of dto.optionalTitles) {
			promises.push(
				this.generateOptionalTitle({
					contentID: contentEntity.id,
					optionalTitle: optTitle,
				})
			);
		}

		await Promise.all(promises);

		return await this.contentRepository.findOne({
			where: { id: contentEntity.id },
			relations: ['optionalTitles', 'images'],
		});
	}

	async createContentWithSubject(
		dto: createWithSubjectContentDto,
		user: UserEntity
	) {
		const prompt = `Create a ${dto.topic} ${dto.textType} using these '${dto.keywords}' keywords. Always complete sentences`;
		const subjectArray = await this.contentRepository.find({
			where: { user: { id: user.id }, subject: { id: dto.subject } },
			relations: ['user'],
		});
		const dialog = subjectArray.map((answer) => {
			return {
				question: prompt,
				answer: answer.text,
			};
		});
		let text = await this.openAiService.getCompletionWithDialog(
			prompt,
			dialog,
			ContentConfigsEnumData[dto.size]
		);
		const subject = await this.subjectRepository.findOne({
			where: { id: dto.subject },
		});

		text = text.replace(/^[\n ]+/, '');

		let imageUrls: string[] | null = null;
		if (dto.images) {
			const MAX_TEXT_LENGTH = 800;

			const truncatedText =
				text.length > MAX_TEXT_LENGTH
					? text.substring(0, MAX_TEXT_LENGTH)
					: text;

			const imageResponse = await this.openAiService.generateImage(
				truncatedText,
				dto
			);
			imageUrls = imageResponse.urls;
		}

		const contentEntity = await this.contentRepository.save({
			keywords: dto.keywords,
			topic: dto.topic,
			textType: dto.textType,
			size: dto.size,
			text,
			user,
			subject,
			images: imageUrls ? imageUrls.map((url) => ({ url })) : null,
		});
		await this.takePointsFromUser(user.id, text.length);

		const promises = [];
		for (const optTitle of dto.optionalTitles) {
			promises.push(
				this.generateOptionalTitle({
					contentID: contentEntity.id,
					optionalTitle: optTitle,
				})
			);
		}

		await Promise.all(promises);

		return await this.contentRepository.findOne({
			where: { id: contentEntity.id },
			relations: ['optionalTitles', 'images', 'subject'],
		});
	}

	async createSubject(dto: CreateSubjectContentDto, user: any) {
		const existingSubject = await this.subjectRepository.findOne({
			where: { name: dto.name, user: { id: user.id } },
		});
		if (existingSubject) {
			throw new ConflictException(ErrorMessages.subject.SUBJECT_ALREADY_EXISTS);
		}
		const newSubject = await this.subjectRepository.create({
			name: dto.name,
			user: user,
		});
		return this.subjectRepository.save(newSubject);
	}

	async deleteSubject(id: string, user: any) {
		const subject = await this.subjectRepository.findOne({
			where: { id },
			relations: ['user'],
		});
		if (!subject) {
			throw new NotFoundException(ErrorMessages.subject.SUBJECT_NOT_FOUND);
		}
		if (user.id !== subject.user.id) {
			throw new ConflictException(ErrorMessages.subject.SUBJECT_NOT_DELETED);
		}
		await this.subjectRepository.remove(subject);
	}

	async updateSubject(id: string, dto: CreateSubjectContentDto, user: any) {
		const subject = await this.subjectRepository.findOne({
			where: { id },
			relations: ['user'],
		});
		if (!subject) {
			throw new NotFoundException(ErrorMessages.subject.SUBJECT_NOT_FOUND);
		}
		if (user.id !== subject.user.id) {
			throw new ConflictException(ErrorMessages.subject.SUBJECT_NOT_UPDATED);
		}
		subject.name = dto.name;
		await this.subjectRepository.save(subject);
		return subject;
	}

	async getAllSubjectsByUser(userId: number, name?: string) {
		const whereClause: any = { user: { id: userId } };

		if (name) {
			whereClause.name = ILike(`%${name}%`);
		}

		const subjects = await this.subjectRepository.find({
			where: whereClause,
		});

		if (!subjects || subjects.length === 0) {
			throw new NotFoundException('No subjects found for the user.');
		}

		return subjects;
	}

	async generateOptionalTitle(
		dto: CreateOptionalTitleDto
	): Promise<OptionalTitleEntity> {
		const parentContent = await this.contentRepository.findOne({
			where: { id: dto.contentID },
			relations: ['optionalTitles', 'user'],
		});
		if (!parentContent) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}

		const prompt = `Create a ${dto.optionalTitle} for this' :\n\n ${parentContent.text}`;

		let text = await this.openAiService.getCompletion(prompt);
		text = text.replace(/^[\n ]+/, '');

		const optionalTitle = await this.optionalTitleRepository.save({
			content: parentContent,
			text,
			title: dto.optionalTitle,
		});

		await this.takePointsFromUser(parentContent.user.id, text.length);

		return optionalTitle;
	}

	async generateHtmlStyledContent(
		dto: CreateHtmlContentDto,
		user: UserEntity
	): Promise<ContentEntity> {
		const prompt = `Create a ${dto.textType} in html format about ${dto.topic}.
		It must contain ${dto.keywords} keywords.
		${
			dto.addImages &&
			'Add images from the internet that will correspond the topic'
		}
		Add styling only with ${dto.stylingFramework}.
		${dto.stylingDescription}
		Remove all possible characters to save space`;

		let text = await this.openAiService.getCompletion(prompt);
		text = text.replace(/^[\n ]+/, '');

		const contentEntity = await this.contentRepository.save({
			keywords: dto.keywords,
			topic: dto.topic,
			textType: dto.textType,
			size: 2000,
			text,
			user,
		});

		await this.takePointsFromUser(user.id, text.length);

		return await this.contentRepository.findOne({
			where: { id: contentEntity.id },
		});
	}

	async getContentById(id: string): Promise<ContentEntity> {
		const content = await this.contentRepository.findOne({
			where: { id },
			relations: ['optionalTitles', 'subject'],
		});
		if (!content) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
		return content;
	}

	async getAllContentsByUserId(id: number): Promise<ContentEntity[]> {
		const contents = await this.contentRepository.find({
			where: { user: { id } },
			relations: ['optionalTitles', 'images', 'subject'],
			order: { creationDate: 'DESC' },
		});
		if (!contents) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
		return contents;
	}

	async getAllContentsByUserAndSubject(
		userId: number,
		subjectId: string
	): Promise<ContentEntity[]> {
		const contents = await this.contentRepository.find({
			where: { user: { id: userId }, subject: { id: subjectId } },
			relations: ['optionalTitles', 'images', 'subject'],
			order: { creationDate: 'DESC' },
		});
		if (!contents || contents.length === 0) {
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

	async updateContentById(
		id: string,
		dto: Partial<ContentEntity>
	): Promise<ContentEntity> {
		const content = await this.contentRepository.findOne({ where: { id } });
		if (!content) {
			throw new NotFoundException(ErrorMessages.content.CONTENT_NOT_FOUND);
		}
		await this.contentRepository.update({ id }, dto);
		return await this.contentRepository.findOne({ where: { id } });
	}

	async takePointsFromUser(id: number, textLength: number) {
		const user = await this.usersRepository.findOne({ where: { id } });

		if (!user) {
			throw new NotFoundException(ErrorMessages.user.USER_NOT_FOUND);
		}
		user.contenterPoints -= textLength / 1000;

		await this.usersRepository.save(user);
	}
}
