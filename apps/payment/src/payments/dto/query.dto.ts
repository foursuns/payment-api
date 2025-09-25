import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaymentType } from '@prisma/client';

export class QueryDto {
  @ApiProperty({ type: String, required: false })
  @IsOptional()
  @IsString()
  readonly cpf?: string;

  @ApiProperty({ required: false, enum: PaymentType })
  @IsOptional()
  @IsEnum(PaymentType, { each: true, message: 'Tipo de pagamento inválido' })
  readonly method?: string;
}
