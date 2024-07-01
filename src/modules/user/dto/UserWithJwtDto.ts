import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { UserDto } from '@modules/user/dto/UserDto';

export class UserWithJwtDto {
	constructor(user: UserDto, token: string) {
		this.user = user;
		this.token = token;
	}

	@ApiProperty({ type: UserDto })
	user: UserDto;

	@ApiProperty({
		type: String,
		example: 'eyJhOiJ...',
	})
	@IsOptional()
	@IsString()
	token: string;
}
