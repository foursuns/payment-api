import { Injectable, HttpStatus } from '@nestjs/common';
import { Prisma, PaymentType } from '@prisma/client';
import { customMessage, MESSAGE, PrismaService, ResponseDto } from '@app/common';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { MercadoPagoService } from '../integrations/mercadopago.service';

export const paymentSelectPublic: Prisma.PaymentSelect = {
  id: true,
  cpf: true,
  description: true,
  amount: true,
  paymentMethod: true,
  status: true,
};

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mercadopagoService: MercadoPagoService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<ResponseDto> {
    try {
      const created = await this.prisma.payment.create({
        data: {
          ...createPaymentDto,
        },
      });

      if (createPaymentDto.paymentMethod === PaymentType.CREDIT_CARD) {
        const mercadoPagoResponse = await this.mercadopagoService.checkout({
          items: {
            cpf: createPaymentDto.cpf,
            description: createPaymentDto.description,
            quantity: 1,
            unit_price: createPaymentDto.amount,
          },
        });
        return customMessage(
          HttpStatus.CREATED,
          MESSAGE.PAYMENT_CREATE_SUCCESS,
          mercadoPagoResponse.data,
        );
      }
      return customMessage(HttpStatus.CREATED, MESSAGE.PAYMENT_CREATE_SUCCESS, created);
    } catch (error) {
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.PAYMENT_CREATE_FAILED, error);
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<ResponseDto> {
    try {
      const updated = await this.prisma.payment.update({
        where: { id },
        data: {
          ...updatePaymentDto,
        },
      });
      return customMessage(HttpStatus.OK, MESSAGE.PAYMENT_UPDATE_SUCCESS, updated);
    } catch (error) {
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.PAYMENT_UPDATE_FAILED, error);
    }
  }

  async findAll(cpf: string, paymentMethod: PaymentType): Promise<ResponseDto> {
    try {
      const payments = await this.prisma.payment.findMany({
        select: paymentSelectPublic,
        where: {
          cpf: cpf,
          paymentMethod: paymentMethod,
        },
      });
      if (payments.length === 0) {
        return customMessage(HttpStatus.NOT_FOUND, MESSAGE.PAYMENT_NOT_FOUND, payments);
      }
      return customMessage(HttpStatus.OK, MESSAGE.PAYMENT_FOUND, payments);
    } catch (error) {
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.PAYMENT_FIND_FAILED);
    }
  }

  async findOne(id: string): Promise<ResponseDto> {
    try {
      const payment = await this.prisma.payment.findUnique({
        select: paymentSelectPublic,
        where: {
          id: id,
        },
      });
      if (!payment) {
        return customMessage(HttpStatus.NOT_FOUND, MESSAGE.PAYMENT_NOT_FOUND, {});
      }
      return customMessage(HttpStatus.OK, MESSAGE.PAYMENT_FOUND, payment);
    } catch (error) {
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.PAYMENT_FIND_FAILED);
    }
  }
}
