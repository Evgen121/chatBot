import { Module, OnModuleInit } from '@nestjs/common';
import { RoleEntity, UserEntity } from '@db/entities';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([RoleEntity, UserEntity])],
	providers: [],
})
export class InitModule implements OnModuleInit {
	constructor(
		@InjectRepository(RoleEntity)
		private readonly roleRepository: Repository<RoleEntity>,

		@InjectRepository(UserEntity)
		private readonly userRepository: Repository<UserEntity>
	) {}

	async onModuleInit() {
		await this.initRoles();
		await this.initAdmin();
	}

	async initAdmin() {
		try {
			const admin = await this.userRepository.findOne({
				where: { email: 'luchevich31@gmail.com' },
			});

			admin.role = await this.roleRepository.findOne({ where: { id: 2 } });
			await this.userRepository.save(admin);
		} catch {}
	}

	async initRoles() {
		const user = new RoleEntity();
		user.name = 'user';
		user.description = 'basic user permissions';
		user.id = 1;

		const admin = new RoleEntity();
		admin.name = 'admin';
		admin.id = 2;
		admin.description = 'admin user permissions';

		const roles = [user, admin];

		for (const role of roles) {
			const existingRole = await this.roleRepository.findOne({
				where: { name: role.name },
			});
			if (!existingRole) {
				await this.roleRepository.save(role);
			}
		}
	}
}
