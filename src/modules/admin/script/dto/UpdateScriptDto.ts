import { ApiProperty } from '@nestjs/swagger';

export class UpdateScriptDto {
	@ApiProperty({
		type: String,
		description: 'Script name',
		example: 'Default',
	})
	name: string;

	@ApiProperty({
		type: String,
		description: 'Java Script code ',
		example:
			'return <img src=${ hostBack }${ picPath }roundedObject.svg alt=close - btn class=custom - rounded - object',
	})
	code: string;
}
