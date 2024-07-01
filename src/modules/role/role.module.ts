import { Module } from '@nestjs/common';
import { RoleController } from './role.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '@db/entities';
import { RoleService } from './role.service';

@Module({
	imports: [TypeOrmModule.forFeature([RoleEntity])],
	controllers: [RoleController],
	providers: [RoleService],
})
export class RoleModule {}
