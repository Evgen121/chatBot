import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ChatBotEntity, RoleEntity, UserEntity } from '@db/entities';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailModule } from '../email/email.module';
import { SharedModule } from '@shared/shared.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity, ChatBotEntity, RoleEntity]),
		ConfigModule,
		SharedModule,
		EmailModule,
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
