import { ConfigModule, ConfigService } from '@nestjs/config/dist';
import * as Models from '@db/entities/index';
import * as AistaModels from '@db/aistaEnities/index';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export const postgresConfig: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get('database.db_host'),
		port: configService.get('database.db_port'),
		username: configService.get('database.db_user'),
		password: configService.get('database.db_password'),
		database: configService.get('database.db_name'),
		synchronize: false,
		autoLoadEntities: true,
		entities: Object.values(Models),
	}),
	dataSourceFactory: async (options) => {
		return await new DataSource(options).initialize();
	},
};

export const aistaPostgresConfig: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	name: 'aista',
	useFactory: (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get('database.db_host'),
		port: configService.get('database.db_port'),
		username: configService.get('database.db_user'),
		password: configService.get('database.db_password'),
		database: configService.get('database2.db_name'),
		synchronize: false,
		entities: Object.values(AistaModels),
	}),
	dataSourceFactory: async (options) => {
		return await new DataSource(options).initialize();
	},
};

export const PostgresConfigForTesting: TypeOrmModuleAsyncOptions = {
	imports: [ConfigModule],
	inject: [ConfigService],
	name: 'testing',
	useFactory: (configService: ConfigService) => ({
		type: 'postgres',
		host: configService.get('database.db_host'),
		port: configService.get('database.db_port'),
		username: configService.get('database.db_user'),
		password: configService.get('database.db_password'),
		database: 'test',
		synchronize: false,
		entities: Object.values(AistaModels),
	}),
	dataSourceFactory: async (options) => {
		return await new DataSource(options).initialize();
	},
};
