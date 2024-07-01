import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RecaptchaService } from '@modules/shared/services/recaptcha.service';

@Injectable()
export class RecapchaGuard implements CanActivate {
	constructor(private readonly recapchaService: RecaptchaService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const headers = request.headers;
		const token = headers['recapcha-token'];

		if (!token) {
			return false;
		}

		return await this.recapchaService.verify(token);
	}
}
