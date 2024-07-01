import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateScriptDto {
	@ApiProperty({
		type: String,
		description: 'Script name',
		example: 'Default',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		type: String,
		description: 'JavaScript code',
		example:
			'const styleTag = document.createElement(style)styleTag.textContent=styleTextdocument.head.appendChild(styleTag) ',
	})
	@IsString()
	@IsNotEmpty()
	code: string;
}
