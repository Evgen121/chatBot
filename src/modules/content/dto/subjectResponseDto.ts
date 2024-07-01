import { ApiProperty } from '@nestjs/swagger';

export class SubjectResponseDto {
	@ApiProperty({
		type: String,
		description: 'The unique identifier of the subject entity',
		example: 'some-uuid-here',
	})
	id: string;

	@ApiProperty({
		type: String,
		description: 'Name of the created subject',
		example: 'Economic',
	})
	name: string;

	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}
