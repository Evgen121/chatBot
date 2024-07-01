import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LogMessage } from '@utils/schemas/logMessage.schema';
import { LogMessageService } from '@modules/logMessage/logMessage.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	constructor(private logMessageService: LogMessageService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();

		if (request.url.includes('admin/log')) {
			return next.handle();
		}
		const log: LogMessage = new LogMessage({});

		log.body = JSON.stringify(request.body);
		log.headers = this.logMessageService.filterHeaders(request.headers);
		log.method = request.method;
		log.params = JSON.stringify(request.params);
		log.query = JSON.stringify(request.query);
		log.url = request.url;
		log.reqDateTime = new Date().toISOString();
		log.role = request.user?.role?.id;
		log.user = JSON.stringify(request.user || {});
		log.ip =
			request.headers['x-forwarded-for'] ||
			request.headers['x-real-ip'] ||
			request.ip;
		log.origin = request?.headers?.origin;

		return next.handle().pipe(
			tap((body) => {
				const response = context.switchToHttp().getResponse();

				log.httpStatus = response.statusCode;
				log.resBody = JSON.stringify(body);
				log.success = true;
				log.executionTime =
					new Date().getTime() - new Date(log.reqDateTime).getTime();

				this.logMessageService.createLogMessage(log);
			}),

			catchError((err: Error) => {
				if (err instanceof HttpException) {
					log.httpStatus = err.getStatus();
					log.resBody = JSON.stringify(err.getResponse());
				}

				log.executionTime =
					new Date().getTime() - new Date(log.reqDateTime).getTime();
				log.success = false;

				this.logMessageService.createLogMessage(log);
				return throwError(err);
			})
		);
	}
}
