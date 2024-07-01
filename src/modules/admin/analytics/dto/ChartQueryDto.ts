import { IsIn, IsOptional, IsString } from 'class-validator';

export class ChartQueryDto {
	@IsString()
	@IsOptional()
	@IsIn(['day', 'month', 'year'])
	interval: string;
	@IsString()
	@IsOptional()
	@IsIn(['all', 'clients', 'test'])
	bots: string;
}
