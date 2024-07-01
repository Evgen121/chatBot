import { registerAs } from '@nestjs/config';
import * as Joi from '@hapi/joi';

const database = registerAs('database', () => ({
	db_port: process.env.DB_PORT,
	db_name: process.env.DB_NAME,
	db_user: process.env.DB_USER,
	db_password: process.env.DB_PASSWORD,
	db_host: process.env.DB_HOST,
}));

const staticFiles = registerAs('static', () => ({
	static_directory: process.env.STATIC_FILE_DIRECTORY,
	static_path: process.env.STATIC_LINK_PATH,
	static_files: process.env.STATIC_FILE_DIRECTORY,
}));

const database2 = registerAs('database2', () => ({
	db_port: process.env.DB_PORT,
	db_name: process.env.DB2_NAME,
	db_user: process.env.DB_USER,
	db_password: process.env.DB_PASSWORD,
	db_host: process.env.DB_HOST,
}));

const aista = registerAs('aista', () => ({
	aista_host: process.env.AISTA_LINK,
	open_ai_key: process.env.OPEN_AI_KEY,
	aista_token: process.env.AISTA_TOKEN,
	vectories: process.env.VECTORIES,
}));

const jwt = registerAs('jwt', () => ({
	secret_jwt: process.env.SECRET,
	expire_jwt: process.env.EXPIRE_JWT,
}));

const mongoConfig = registerAs('mongo', () => ({
	mongo_connection_string: process.env.MONGO_CONNECTION_STRING,
}));

const unlogableRoutes = registerAs('unlogable_routes', () => ({
	routes: process.env.UNLOGABLE_ROUTES,
}));

const sendgrid = registerAs('sendgrid', () => ({
	sendgrid: process.env.SENDGRID_API_KEY,
	formEmail: process.env.FROM_EMAIL,
	rest_password_url: process.env.RESET_PASSWORD_URL,
}));

const openAi = registerAs('openAi', () => ({
	api_keys: process.env.OPENAI_API_KEYS,
}));

const google = registerAs('google', () => ({
	client_id: process.env.GOOGLE_AUTH_CLIENT_ID,
	client_secret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
	callback_url: process.env.GOOGLE_AUTH_CALLBACK_URL,
	scope: process.env.GOOGLE_AUTH_SCOPE,
}));

const totp = registerAs('totp', () => ({
	secret: process.env.TOTP_SECRET,
	step: process.env.TOTP_STEP,
}));

export default {
	envFilePath: '.env',
	validationSchema: Joi.object({
		DB_PORT: Joi.string().required(),
		DB_NAME: Joi.string().required(),
		DB2_NAME: Joi.string().required(),
		DB_USER: Joi.string().required(),
		DB_PASSWORD: Joi.string().required(),
		DB_HOST: Joi.string().required(),

		MONGO_CONNECTION_STRING: Joi.string().required(),
		UNLOGABLE_ROUTES: Joi.string().required(),
		AISTA_TOKEN: Joi.string().required(),
		STATIC_FILE_DIRECTORY: Joi.string().required(),
		STATIC_LINK_PATH: Joi.string().required(),
		VECTORIES: Joi.string().required(),
		RESET_PASSWORD_URL: Joi.string().required(),

		SECRET: Joi.string().required(),
		EXPIRE_JWT: Joi.string().required(),

		SENDGRID_API_KEY: Joi.string().required(),
		FROM_EMAIL: Joi.string().required(),

		OPEN_AI_KEY: Joi.string().required(),
		OPENAI_API_KEYS: Joi.string().required(),

		GOOGLE_AUTH_CLIENT_ID: Joi.string().required(),
		GOOGLE_AUTH_CLIENT_SECRET: Joi.string().required(),
		GOOGLE_AUTH_CALLBACK_URL: Joi.string().required(),
		GOOGLE_AUTH_SCOPE: Joi.string().required(),

		TOTP_SECRET: Joi.string().required(),
		TOTP_STEP: Joi.string().required(),
	}),
	load: [
		database,
		database2,
		aista,
		staticFiles,
		jwt,
		mongoConfig,
		unlogableRoutes,
		sendgrid,
		openAi,
		google,
		totp,
	],
};
