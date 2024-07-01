import { ApiProperty } from '@nestjs/swagger';

export class SubjectUpdateResponseDto {
	@ApiProperty({
		type: String,
		description: 'Updated name of the subject',
		example: 'New Economic',
	})
	name: string;

	constructor(id: string, name: string) {
		this.name = name;
	}
}
