import { IsString, IsInt } from 'class-validator';

export class ReverseOrderResponseDto {
	@IsString()
	order_id: string;

	@IsInt()
	merchant_id: number;

	@IsString()
	revers_status: string;

	@IsString()
	response_status: string;

	@IsString()
	signature: string;

	@IsInt()
	response_code: number;

	@IsString()
	response_description: string;
}
