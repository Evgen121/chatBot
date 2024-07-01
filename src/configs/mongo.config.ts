import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';

export const mongoConfig: MongooseModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		uri: configService.get('mongo.mongo_connection_string'),
	}),
};
