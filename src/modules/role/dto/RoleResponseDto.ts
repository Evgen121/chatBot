import { RoleEntity } from '@db/entities';
import { RoleDto } from './RoleDto';
import { ApiProperty } from '@nestjs/swagger';

export class RoleResponseDto {
	constructor(roles: RoleEntity[], total: number) {
		this.data = roles.map((role) => new RoleDto(role));
		this.total = total;
	}
	@ApiProperty({
		type: [RoleDto],
	})
	data: RoleDto[];

	@ApiProperty({
		type: Number,
		example: 3,
	})
	total: number;
}
