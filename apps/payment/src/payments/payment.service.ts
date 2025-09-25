import { Injectable, HttpStatus } from '@nestjs/common';
import { Prisma, PaymentType } from '@prisma/client';
import { customMessage, MESSAGE, PrismaService, ResponseDto } from '@app/common';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';

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
  constructor(private readonly prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<ResponseDto> {
    try {
      const newPayment = await this.prisma.$transaction(async tx => {
        const createdPayment = await tx.payment.create({
          data: {
            ...createPaymentDto,
          },
        });
        return createdPayment;
      });
      return customMessage(HttpStatus.CREATED, MESSAGE.PAYMENT_CREATE_SUCCESS, newPayment);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return customMessage(HttpStatus.CONFLICT, MESSAGE.PAYMENT_ALREADY);
        }
      }
      return customMessage(HttpStatus.BAD_REQUEST, MESSAGE.PAYMENT_CREATE_FAILED, error);
    }
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<ResponseDto> {
    try {
      const updated = await this.prisma.$transaction(async tx => {
        const updatedPayment = await tx.payment.update({
          where: { id },
          data: {
            ...updatePaymentDto,
          },
        });
        return updatedPayment;
      });
      return customMessage(HttpStatus.OK, MESSAGE.PAYMENT_UPDATE_SUCCESS, updated);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return customMessage(HttpStatus.CONFLICT, MESSAGE.PAYMENT_ALREADY);
        }
      }
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
