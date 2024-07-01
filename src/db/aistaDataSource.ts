import { DataSource } from 'typeorm';
import * as AistaEntities from './aistaEnities/index';
import { Logger } from '@nestjs/common';

export const AistaDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'root',
	database: 'postgres2',
	entities: Object.values(AistaEntities),
	migrations: ['./src/db/aistaMigrations/*.ts'],
});

const logger = new Logger('Aista datasource');

AistaDataSource.initialize()
	.then(() => {
		logger.log('Aista Data Source has been initialized!');
	})
	.catch((err) => {
		logger.error('Error during Aista Data Source initialization', err);
	});
