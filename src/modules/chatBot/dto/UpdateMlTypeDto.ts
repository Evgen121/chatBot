import {
	IsString,
	IsInt,
	IsNumber,
	IsBoolean,
	IsOptional,
} from 'class-validator';

export class UpdateMlTypeDto {
	@IsString()
	@IsOptional()
	api_key: string | null;

	@IsString()
	@IsOptional()
	auth: string | null;

	@IsString()
	@IsOptional()
	flavor: string | null;

	@IsString()
	@IsOptional()
	base_url: string | null;

	@IsInt()
	@IsOptional()
	cached: number;

	@IsString()
	@IsOptional()
	contact_us: string | null;

	@IsString()
	@IsOptional()
	greeting: string | null;

	@IsString()
	@IsOptional()
	lead_email: string | null;

	@IsString()
	@IsOptional()
	recaptcha_key: string | null;

	@IsString()
	@IsOptional()
	recaptcha_secret: string | null;

	@IsInt()
	@IsOptional()
	max_context_tokens: number | null;

	@IsInt()
	@IsOptional()
	max_request_tokens: number | null;

	@IsInt()
	@IsOptional()
	max_tokens: number;

	@IsString()
	@IsOptional()
	model: string;

	@IsString()
	@IsOptional()
	prefix: string | null;

	@IsNumber()
	@IsOptional()
	recaptcha: number;

	@IsInt()
	@IsOptional()
	supervised: number;

	@IsString()
	@IsOptional()
	system_message: string | null;

	@IsNumber()
	@IsOptional()
	temperature: number;

	@IsNumber()
	@IsOptional()
	threshold: number;

	@IsString()
	@IsOptional()
	twilio_account_id: string | null;

	@IsString()
	@IsOptional()
	twilio_account_sid: string | null;

	@IsBoolean()
	@IsOptional()
	use_embeddings: boolean;

	@IsString()
	@IsOptional()
	webhook_incoming: string | null;

	@IsString()
	@IsOptional()
	webhook_incoming_url: string | null;

	@IsString()
	@IsOptional()
	webhook_outgoing: string | null;

	@IsString()
	@IsOptional()
	webhook_outgoing_url: string | null;
}
