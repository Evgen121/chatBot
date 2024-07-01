import {
	HttpException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import {
	LogMessage,
	LogMessageDocument,
} from '@utils/schemas/logMessage.schema';
import { ErrorMessages } from '@utils/errors/errors';

@Injectable()
export class LogMessageService {
	constructor(
		@InjectModel(LogMessage.name)
		private logMessageModel: Model<LogMessageDocument>,
		private configService: ConfigService
	) {}

	filterHeaders(headers: any) {
		const filteredHeaders = headers;

		filteredHeaders.authorization = 'Unlogable';
		return JSON.stringify(filteredHeaders);
	}
	async createLogMessage(logMessage: LogMessage): Promise<LogMessageDocument> {
		try {
			const unlogableRoutes = this.configService.get('unlogable_routes.routes');

			if (unlogableRoutes.includes(logMessage.url)) {
				logMessage.body = '{"Unlogable": "Unlogable"}';
				logMessage.params = '{"Unlogable": "Unlogable"}';
				logMessage.query = '{"Unlogable": "Unlogable"}';

				if (logMessage.success === true) {
					logMessage.resBody = '{"Unlogable": "Unlogable"}';
				}
			}

			const createdLogMessage = new this.logMessageModel(logMessage);
			return await createdLogMessage.save();
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.log.CREATE_LOG_MESSAGE_FAILED
			);
		}
	}

	async getPageLogMessages(query: any): Promise<LogMessageDocument[]> {
		try {
			const { limit, page, sort, offset } = query;

			const filterObj = {};

			if (query.filter) {
				query.filter.forEach((filterItem: string) => {
					const [field, , value] = filterItem.split('||');
					filterObj[field] = { $regex: value, $options: 'i' };
				});
			}

			const sortObj = {};

			if (sort) {
				const [field, order] = sort[0].split(',');
				sortObj[field] = order === 'DESC' ? -1 : 1;
			}

			const perPage = limit ? parseInt(limit, 10) : 10;
			const skip = offset
				? parseInt(offset, 10)
				: page
				? (parseInt(page, 10) - 1) * perPage
				: 0;

			const logMessages = await this.logMessageModel
				.find(filterObj)
				.sort(sortObj)
				.skip(skip)
				.limit(perPage)
				.exec();

			return logMessages;
		} catch (error) {
			throw new InternalServerErrorException(
				ErrorMessages.log.GET_LOG_MESSAGES_FAILED
			);
		}
	}

	async totalLogMessages(): Promise<number> {
		return await this.logMessageModel.countDocuments({}).exec();
	}

	async findOneById(id: string): Promise<any> {
		try {
			const logMessage = await this.logMessageModel.findOne({ id }).exec();
			if (!logMessage) {
				throw new NotFoundException(ErrorMessages.log.LOG_NOT_FOUND);
			}

			return logMessage;
		} catch (error) {
			throw new HttpException('Some Error', HttpStatus.BAD_REQUEST);
		}
	}

	async deleteAllLogMessages(): Promise<any> {
		try {
			const deleteLog = await this.logMessageModel.deleteMany({}).exec();
			return deleteLog;
		} catch {
			throw new InternalServerErrorException(
				ErrorMessages.log.DELETE_LOG_FAILED
			);
		}
	}
}
