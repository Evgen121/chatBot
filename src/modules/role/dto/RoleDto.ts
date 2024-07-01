import { ApiProperty } from '@nestjs/swagger';
import { RoleEntity } from '@db/entities';

export class RoleDto {
	constructor(role: RoleEntity) {
		this.id = role.id;
		this.name = role.name;
		this.description = role.description;
	}

	@ApiProperty({
		type: Number,
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		example: 'user',
	})
	name: string;

	@ApiProperty({
		type: String,
		example: 'user',
	})
	description: string;
}
