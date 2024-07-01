import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogMessageService } from './logMessage.service';
import { ConfigModule } from '@nestjs/config';
import { LogMessageController } from './logMessage.controller';
import { LogMessage, LogMessageSchema } from '@utils/schemas/logMessage.schema';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@db/entities';
import { SharedModule } from '@shared/shared.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		MongooseModule.forFeature([
			{ name: LogMessage.name, schema: LogMessageSchema },
		]),
		ConfigModule,
		SharedModule,
	],
	controllers: [LogMessageController],
	providers: [LogMessageService],
})
export class LogMessageModule {}
