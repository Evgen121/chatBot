import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as Entities from './entities/index';

export const AppDataSource = new DataSource({
	type: 'postgres',
	host: 'localhost',
	port: 5432,
	username: 'postgres',
	password: 'root',

	entities: Object.values(Entities),
	migrations: ['./src/db/migrations/*.ts'],
});

const logger: Logger = new Logger('Datasource');

AppDataSource.initialize()
	.then(() => {
		logger.log('Data Source has been initialized!');
	})
	.catch((err) => {
		logger.error('Error during Data Source initialization', err);
	});
