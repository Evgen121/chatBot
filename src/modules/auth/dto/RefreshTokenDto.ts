import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
	@ApiProperty({
		type: String,
		required: true,
		example:
			'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7IlkSjoxLCJ1c2VybmFtZSI6ImRhbiIsInN1cm5hbWUiOiJxd2VyMzJGSEfN0eSIsImRvbWFpbiI6bnVsbCwiZW1haWwiOiJsdWNoZXZpY2gzMUBnbWFpbC5jb20iLCJyZXNldFRva2VuIjpudWxsfSwiaWF0IjoxNjgyMzM0OTM4LCJleHAiOjE2O23540MjEzMzh9.6hYtaUVgxWpuCuuDcn_xwskrjf7Nr8fvNKlSxNghz63P4',
	})
	@IsString()
	token: string;
}
