import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';

export class MercadoPagoWebhookDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsObject()
  @IsNotEmpty()
  data: {
    id: string;
  };

  @IsString()
  @IsOptional()
  live_mode?: boolean;
}
