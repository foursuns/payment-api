import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Payment HTTP ');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const httpContext = context.switchToHttp();
    const req = httpContext.getRequest<Request>();
    const res = httpContext.getResponse<Response>();

    const { method, originalUrl, ip, headers, body, params, query } = req;

    return next.handle().pipe(
      tap({
        next: data => {
          const logObject = {
            method,
            statusCode: res.statusCode,
            originalUrl,
            ip,
            headers,
            params,
            query,
            time: `${Date.now() - now} ms`,
            response: data,
          };
          this.logger.log(JSON.stringify(logObject));
        },
        error: err => {
          const statusCode = err.status || 500;
          const logObject = {
            method,
            statusCode,
            originalUrl,
            ip,
            headers,
            body,
            params,
            query,
            time: `${Date.now() - now} ms`,
            response: err.response || err.message,
          };

          const logMessage = JSON.stringify(logObject);

          if (statusCode >= 200 && statusCode < 400) {
            this.logger.log(logMessage);
          } else if (statusCode >= 400 && statusCode < 500) {
            this.logger.warn(logMessage);
          } else {
            this.logger.error(logMessage);
          }
        },
      }),
    );
  }
}
