import { ResponseDto } from '@app/common';

export function customMessage(statusCode: number, message: string, data = {}): ResponseDto {
  return {
    statusCode: statusCode,
    message: message,
    data: data,
  };
}
