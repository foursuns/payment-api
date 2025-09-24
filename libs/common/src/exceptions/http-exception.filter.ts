import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '@app/common';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(error: ResponseDto, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (error instanceof HttpException) {
      response.status(error.getStatus()).json({
        statusCode: error.getStatus(),
        message: error.message,
        error: error.name,
      });
    } else {
      const status = error?.statusCode || 500;
      response.status(status).json({
        statusCode: status,
        message: error.message,
        error: 'Internal Server Error',
      });
    }
  }
}
