import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';

@Injectable()
export class TOTPService {
	private readonly secret: string;
	private readonly step: number;

	constructor() {
		this.secret = process.env.TOTP_SECRET;
		this.step = Number(process.env.TOTP_STEP);
	}

	generateSecret() {
		return speakeasy.generateSecret({ length: 20 });
	}

	generateTOTP() {
		return speakeasy.totp({
			secret: this.secret,
			encoding: 'base32',
			step: this.step,
		});
	}

	verifyTOTP(token: string) {
		return speakeasy.totp.verify({
			secret: this.secret,
			encoding: 'base32',
			token: token,
			step: this.step,
		});
	}
}
