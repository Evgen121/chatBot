import { ApiProperty } from '@nestjs/swagger';
import { ScriptEntity } from '@db/entities';

export class ScriptDto {
	constructor(script: ScriptEntity) {
		this.id = script.id;
		this.name = script.name;
		this.code = script.code;
	}

	@ApiProperty({
		type: Number,
		description: 'Script id',
		example: 1,
	})
	id: number;

	@ApiProperty({
		type: String,
		description: 'Script name',
		example: 'Default',
	})
	name: string;

	@ApiProperty({
		type: String,
		description: 'JavaScript code',
		example:
			'const styleTag = document.createElement(style)styleTag.textContent=styleTextdocument.head.appendChild(styleTag) ',
	})
	code: string;
}
