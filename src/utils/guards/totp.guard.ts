import { CanActivate, ExecutionContext } from '@nestjs/common/interfaces';
import { TOTPService } from '@modules/shared/services/totp.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TOTPGuard implements CanActivate {
	constructor(private readonly totpService: TOTPService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const headers = request.headers;
		const totpcode = headers.totpcode;

		const isVerified = this.totpService.verifyTOTP(totpcode);

		if (!isVerified) {
			return false;
		}

		return true;
	}
}
