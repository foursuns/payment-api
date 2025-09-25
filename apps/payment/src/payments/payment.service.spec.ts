import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { PaymentType, Prisma } from '@prisma/client';
import { CreatePaymentDto, UpdatePaymentDto } from '../payments/dto/payment.dto';
import { PaymentService } from '../payments/payment.service';
import { MESSAGE, PrismaService } from '@app/common';

const mockPrismaService = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation(callback => callback(mockPrismaService)),
};

describe('PaymentService', () => {
  let service: PaymentService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // --- Teste para o método `create` ---
  describe('create', () => {
    const mockCreateDto: CreatePaymentDto = {
      cpf: '12345678901',
      description: 'Teste de pagamento',
      amount: 100,
      paymentMethod: PaymentType.PIX,
      status: 'PENDING',
    };

    it('should create a new payment successfully', async () => {
      const mockCreatedPayment = { ...mockCreateDto, id: 'some-uuid' };
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = { payment: { create: jest.fn().mockResolvedValue(mockCreatedPayment) } };
        return callback(tx);
      });

      const result = await service.create(mockCreateDto);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGE.PAYMENT_CREATE_SUCCESS);
      expect(result.data).toEqual(mockCreatedPayment);
    });

    it('should return a conflict message if the payment already exists (P2002 error)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '2.19.0',
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async () => {
        throw prismaError;
      });

      const result = await service.create(mockCreateDto);

      expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe(MESSAGE.PAYMENT_ALREADY);
    });

    it('should return a bad request message on generic error', async () => {
      const genericError = new Error('Generic error');
      (prisma.$transaction as jest.Mock).mockImplementation(async () => {
        throw genericError;
      });

      const result = await service.create(mockCreateDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_CREATE_FAILED);
    });
  });

  // --- Teste para o método `update` ---
  describe('update', () => {
    const mockUpdateDto: UpdatePaymentDto = { status: 'PAID' };
    const paymentId = 'some-uuid';

    it('should update a payment successfully', async () => {
      const mockUpdatedPayment = { ...mockUpdateDto, id: paymentId };
      (prisma.$transaction as jest.Mock).mockImplementation(async callback => {
        const tx = { payment: { update: jest.fn().mockResolvedValue(mockUpdatedPayment) } };
        return callback(tx);
      });

      const result = await service.update(paymentId, mockUpdateDto);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGE.PAYMENT_UPDATE_SUCCESS);
      expect(result.data).toEqual(mockUpdatedPayment);
    });

    it('should return a conflict message if the update fails due to a P2002 error', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Error', {
        code: 'P2002',
        clientVersion: '2.19.0',
      });
      (prisma.$transaction as jest.Mock).mockImplementation(async () => {
        throw prismaError;
      });

      const result = await service.update(paymentId, mockUpdateDto);

      expect(result.statusCode).toBe(HttpStatus.CONFLICT);
      expect(result.message).toBe(MESSAGE.PAYMENT_ALREADY);
    });

    it('should return a bad request message on generic error during update', async () => {
      const genericError = new Error('Generic error');
      (prisma.$transaction as jest.Mock).mockImplementation(async () => {
        throw genericError;
      });

      const result = await service.update(paymentId, mockUpdateDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_UPDATE_FAILED);
    });
  });

  // --- Teste para o método `findAll` ---
  describe('findAll', () => {
    const mockPayments = [
      { id: '1', cpf: '123' },
      { id: '2', cpf: '456' },
    ];

    it('should find payments successfully', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);
      const result = await service.findAll('12345678901', PaymentType.PIX);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGE.PAYMENT_FOUND);
      expect(result.data).toEqual(mockPayments);
    });

    it('should return a not found message if no payments are found', async () => {
      mockPrismaService.payment.findMany.mockResolvedValue([]);

      const result = await service.findAll('123', PaymentType.PIX);

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(MESSAGE.PAYMENT_NOT_FOUND);
      expect(result.data).toEqual([]);
    });

    it('should return a bad request on generic error during find all', async () => {
      mockPrismaService.payment.findMany.mockRejectedValue(new Error());

      const result = await service.findAll('123', PaymentType.PIX);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_FIND_FAILED);
    });
  });

  // --- Teste para o método `findOne` ---
  describe('findOne', () => {
    const paymentId = 'some-uuid';
    const mockPayment = { id: paymentId, cpf: '123' };

    it('should find a payment successfully', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);

      const result = await service.findOne(paymentId);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGE.PAYMENT_FOUND);
      expect(result.data).toEqual(mockPayment);
    });

    it('should return a not found message if payment is not found', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);

      const result = await service.findOne(paymentId);

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(MESSAGE.PAYMENT_NOT_FOUND);
      expect(result.data).toEqual({});
    });

    it('should return a bad request message on generic error', async () => {
      mockPrismaService.payment.findUnique.mockRejectedValue(new Error());

      const result = await service.findOne(paymentId);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_FIND_FAILED);
    });
  });
});
