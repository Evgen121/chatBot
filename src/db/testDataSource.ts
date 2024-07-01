import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Entities from './entities/index';

export const TestDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'root',
	database: 'test',
	entities: Object.values(Entities),
	migrations: ['./src/db/testMigrations/*.ts'],
});

const logger: Logger = new Logger('TestDataSource');

TestDataSource.initialize()
	.then(() => {
		logger.log('TestDataSource has been initialized!');
	})
	.catch((err) => {
		logger.error('Error during Test Data Source initialization', err);
	});
