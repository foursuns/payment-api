import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from '../payments/payment.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { QueryDto } from './dto/query.dto';
import { PaymentType } from '@prisma/client';

const mockPaymentService = {
  create: jest.fn(),
  update: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
};

describe('PaymentController', () => {
  let controller: PaymentController;
  let service: PaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentController],
      providers: [
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    controller = module.get<PaymentController>(PaymentController);
    service = module.get<PaymentService>(PaymentService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new payment and return a successful response', async () => {
      const mockDto: CreatePaymentDto = {
        cpf: '12345678901',
        description: 'Test Payment',
        amount: 100,
        paymentMethod: PaymentType.PIX,
        status: 'PENDING',
      };
      mockPaymentService.create.mockResolvedValue({
        statusCode: HttpStatus.CREATED,
        message: 'Payment created successfully',
        data: mockDto,
      });

      const result = await controller.create(mockDto);

      expect(service.create).toHaveBeenCalledWith(mockDto);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Payment created successfully');
    });
  });

  describe('update', () => {
    it('should update a payment and return a successful response', async () => {
      const mockId = 'uuid-123';
      const mockDto: UpdatePaymentDto = { status: 'PAID' };
      mockPaymentService.update.mockResolvedValue({
        statusCode: HttpStatus.OK,
        message: 'Payment updated successfully',
        data: mockDto,
      });

      const result = await controller.update(mockId, mockDto);

      expect(service.update).toHaveBeenCalledWith(mockId, mockDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Payment updated successfully');
    });
  });

  describe('findOne', () => {
    it('should find a payment and return a successful response', async () => {
      const mockId = 'uuid-123';
      mockPaymentService.findOne.mockResolvedValue({
        statusCode: HttpStatus.OK,
        message: 'Payment found',
        data: { id: mockId, cpf: '123' },
      });

      const result = await controller.findOne(mockId);

      expect(service.findOne).toHaveBeenCalledWith(mockId);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect((result.data as { id: string }).id).toBe(mockId);
    });
  });

  describe('findAll', () => {
    it('should find all payments with valid query parameters', async () => {
      const mockQuery: QueryDto = {
        cpf: '12345678901',
        method: 'PIX',
      };
      mockPaymentService.findAll.mockResolvedValue({
        statusCode: HttpStatus.OK,
        message: 'Payments found',
        data: [{ id: '1', cpf: '12345678901' }],
      });

      const result = await controller.findAll(mockQuery);

      const expectedPaymentType = mockQuery.method as PaymentType;
      expect(service.findAll).toHaveBeenCalledWith(mockQuery.cpf, expectedPaymentType);
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should handle a missing method query parameter', async () => {
      const mockQuery: QueryDto = {
        cpf: '12345678901',
        method: undefined,
      };
      mockPaymentService.findAll.mockResolvedValue({
        statusCode: HttpStatus.OK,
        message: 'Payments found',
      });

      const result = await controller.findAll(mockQuery);

      expect(service.findAll).toHaveBeenCalledWith(mockQuery.cpf, undefined);
      expect(result.statusCode).toBe(HttpStatus.OK);
    });
  });
});
