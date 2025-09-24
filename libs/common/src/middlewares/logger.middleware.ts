import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Cygnus HTTP ');

  use(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();
    const { method, originalUrl, ip, headers, body, params, query } = req;
    let logObject = {};

    res.on('finish', () => {
      const { statusCode } = res;
      if (process.env.NODE_ENV === 'development') {
        logObject = {
          method,
          statusCode,
          originalUrl,
        };
      } else {
        const time = `${Date.now() - now} ms`;
        logObject = {
          method,
          statusCode,
          originalUrl,
          ip,
          headers,
          body,
          params,
          query,
          time,
        };
      }

      const logMessage = JSON.stringify(logObject);

      if (statusCode >= 200 && statusCode < 400) {
        this.logger.log(logMessage);
      } else if (statusCode === 401 || statusCode === 402 || statusCode === 403) {
        this.logger.warn(logMessage);
      } else {
        this.logger.error(logMessage);
      }
    });
    next();
  }
}
