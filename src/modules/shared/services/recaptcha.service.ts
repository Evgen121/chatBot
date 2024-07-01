import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RecaptchaService {
	async verify(token: string): Promise<boolean> {
		const recaptcha_keys = [
			process.env.CONTENTER_RECAPTCHA_SECRET,
			process.env.CHATBOT_RECAPTCHA_SECRET,
			process.env.PORTFOLIO_RECAPTCHA_SECRET,
		];

		const results = [];

		const promises = recaptcha_keys.map(async (key) => {
			const url = `https://www.google.com/recaptcha/api/siteverify?secret=${key}&response=${token}`;
			const response = await axios.post(url);
			results.push(response.data.success);
		});

		await Promise.allSettled(promises);

		return results.includes(true);
	}
}
