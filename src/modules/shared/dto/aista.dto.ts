export interface UpdateBotDTO {
	expiryDate: Date;
	type: string;
	tone: string;
	chatBotName: string;
	style: string;
	button: string;
	styleId: string;
	footer: string;
	askMe: string;
	isActive: boolean;
	model: string;
	max_tokens: number;
	max_context_tokens: number;
	max_request_tokens: number;
	temperature: number;
	recaptcha: number;
	auth: string;
	supervised: number;
	cached: number;
	prefix: string;
	use_embeddings: number;
	threshold: number;
	vector_model: string;
	greeting: string;
}
