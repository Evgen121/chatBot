import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { LogMessageService } from './modules/logMessage/logMessage.service';
import { LoggingInterceptor } from './utils/interceptors/loggin.interceptor';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const port = process.env.PORT;

	app.useGlobalPipes(new ValidationPipe());

	const logService = app.get(LogMessageService);
	app.useGlobalInterceptors(new LoggingInterceptor(logService));
	app.use(json({ limit: '50mb' }));
	app.use(urlencoded({ extended: true, limit: '50mb' }));
	app.enableCors();
	const config = new DocumentBuilder()
		.setTitle('Coderfy API')
		.setDescription(
			'This api page includes api documentation for both content generation and custom chat bot'
		)
		.setVersion('1')
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	await app.listen(port);
}
bootstrap();
