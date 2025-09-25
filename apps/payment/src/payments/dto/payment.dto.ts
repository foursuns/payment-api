import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty, IsNumber, Min, Validate, MinLength } from 'class-validator';
import { PaymentType, StatusType } from '@prisma/client';
import { IsCpfValidConstraint } from '@app/common';

export class CreatePaymentDto {
  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'C.P.F. não pode ser vazio' })
  @IsString()
  @MinLength(11, { message: 'CPF deve ter pelo menos 11 dígitos' })
  @Validate(IsCpfValidConstraint)
  readonly cpf: string;

  @ApiProperty({ type: String, required: true })
  @IsNotEmpty({ message: 'Descrição não pode ser vazia' })
  @IsString()
  readonly description: string;

  @ApiProperty({ type: Number, required: true })
  @IsNotEmpty({ message: 'Valor não pode ser vazio.' })
  @IsNumber({}, { message: 'Valor deve ser um número.' })
  @Min(0.01, { message: 'Valor deve ser positivo.' })
  readonly amount: number;

  @ApiProperty({ required: true, enum: PaymentType, default: PaymentType.PIX })
  @IsEnum(PaymentType, { each: true, message: 'Inválido método de pagamento' })
  @IsNotEmpty({ message: 'Método de pagamento não pode ser vazio' })
  readonly paymentMethod: PaymentType;

  @ApiProperty({ required: true, enum: StatusType, default: StatusType.PENDING })
  @IsEnum(StatusType, { each: true, message: 'Inválido status de pagamento' })
  @IsNotEmpty({ message: 'Status de pagamento não pode ser vazio' })
  readonly status: StatusType;
}
export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
