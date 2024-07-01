import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ml_types' })
export class MLType {
	@PrimaryColumn({ type: 'varchar', length: 256 })
	type: string;

	@Column({ type: 'varchar', length: 1024, nullable: false })
	model: string;

	@Column({ type: 'integer', nullable: false })
	max_tokens: number;

	@Column({ type: 'numeric', nullable: false })
	temperature: number;

	@Column({ type: 'numeric', default: 0, nullable: false })
	recaptcha: number;

	@Column({ type: 'text', nullable: true })
	auth: string | null;

	@Column({ type: 'smallint', default: 0, nullable: false })
	supervised: number;

	@Column({ type: 'smallint', default: 0, nullable: false })
	cached: number;

	@Column({ type: 'text', nullable: true })
	prefix: string | null;

	@Column({ type: 'smallint', default: 0, nullable: false })
	use_embeddings: number;

	@Column({ type: 'real', default: 0.8, nullable: false })
	threshold: number;

	@Column({
		type: 'varchar',
		length: 1024,
		default: 'text-embedding-ada-002',
		nullable: false,
	})
	vector_model: string;

	@Column({ type: 'text', nullable: true })
	recaptcha_key: string | null;

	@Column({ type: 'text', nullable: true })
	recaptcha_secret: string | null;

	@Column({ type: 'integer', nullable: true })
	max_context_tokens: number | null;

	@Column({ type: 'integer', nullable: true })
	max_request_tokens: number | null;

	@Column({ type: 'text', nullable: true })
	greeting: string | null;

	@Column({ type: 'text', nullable: true })
	base_url: string | null;

	@Column({ type: 'text', nullable: true })
	contact_us: string | null;

	@Column({ type: 'text', nullable: true })
	lead_email: string | null;

	@Column({ type: 'text', nullable: true })
	api_key: string | null;

	@Column({ type: 'boolean', default: true, nullable: false })
	is_active: boolean;

	@Column({ type: 'text', nullable: true })
	twilio_account_sid: string | null;

	@Column({ type: 'text', nullable: true })
	twilio_account_id: string | null;

	@Column({ type: 'text', nullable: true })
	system_message: string | null;
}
