import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { PaymentType, StatusType } from '@prisma/client';
import { CreatePaymentDto } from '../src/payments/dto/payment.dto';
import { PaymentService } from '../src/payments/payment.service';
import { MercadoPagoService } from '../src/integrations/mercadopago.service';
import { MESSAGE, PrismaService } from '@app/common';

const mockPrismaService = {
  payment: {
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
};

const mockMercadoPagoService = {
  checkout: jest.fn(),
};

describe('PaymentService', () => {
  let service: PaymentService;
  let mercadopago: MercadoPagoService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: MercadoPagoService,
          useValue: mockMercadoPagoService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    mercadopago = module.get<MercadoPagoService>(MercadoPagoService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mercadopago).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('create', () => {
    const mockCreateDto: CreatePaymentDto = {
      cpf: '12345678901',
      description: 'Teste de pagamento',
      amount: 100,
      paymentMethod: PaymentType.PIX,
      status: StatusType.PENDING,
    };

    it('should create a new PIX payment successfully', async () => {
      const mockCreatedPayment = { ...mockCreateDto, id: 'some-uuid' };
      mockPrismaService.payment.create.mockResolvedValue(mockCreatedPayment);

      const result = await service.create(mockCreateDto);

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({ data: mockCreateDto });
      expect(mockMercadoPagoService.checkout).not.toHaveBeenCalled();
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGE.PAYMENT_CREATE_SUCCESS);
      expect(result.data).toEqual(mockCreatedPayment);
    });

    it('should create a CREDIT_CARD payment and return Mercado Pago response', async () => {
      const creditCardDto: CreatePaymentDto = {
        cpf: '12345678901',
        description: 'Teste de pagamento Cartão',
        amount: 150,
        paymentMethod: PaymentType.CREDIT_CARD,
        status: 'PENDING',
      };
      const mockMercadoPagoResponse = {
        data: { checkoutUrl: 'http://mercadopago.com/checkout' },
      };
      const mockCreatedPayment = { ...creditCardDto, id: 'some-uuid' };

      mockPrismaService.payment.create.mockResolvedValue(mockCreatedPayment);
      mockMercadoPagoService.checkout.mockResolvedValue(mockMercadoPagoResponse);

      const result = await service.create(creditCardDto);

      expect(mockPrismaService.payment.create).toHaveBeenCalledWith({ data: creditCardDto });
      expect(mockMercadoPagoService.checkout).toHaveBeenCalledWith({
        items: {
          cpf: creditCardDto.cpf,
          description: creditCardDto.description,
          quantity: 1,
          unit_price: creditCardDto.amount,
        },
      });
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGE.PAYMENT_CREATE_SUCCESS);
      expect(result.data).toEqual({ ...mockCreatedPayment, ...mockMercadoPagoResponse.data });
    });

    it('should return a bad request message on generic error', async () => {
      const genericError = new Error('Generic error');
      mockPrismaService.payment.create.mockRejectedValue(genericError);

      const result = await service.create(mockCreateDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_CREATE_FAILED);
    });
  });

  describe('update', () => {
    const paymentId = 'some-uuid';
    const mockUpdateDto = {
      status: StatusType.PAID,
    };

    const mockUpdatedPayment = {
      id: paymentId,
      cpf: '12345678901',
      description: 'Test payment',
      amount: 100,
      paymentMethod: PaymentType.PIX,
      ...mockUpdateDto,
    };

    it('should update a payment successfully', async () => {
      mockPrismaService.payment.update.mockResolvedValue(mockUpdatedPayment);

      const result = await service.update(paymentId, mockUpdateDto);

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: paymentId },
        data: mockUpdateDto,
      });

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGE.PAYMENT_UPDATE_SUCCESS);
      expect(result.data).toEqual(mockUpdatedPayment);
    });

    it('should return a bad request message on generic error during update', async () => {
      const genericError = new Error('Generic error');
      mockPrismaService.payment.update.mockRejectedValue(genericError);

      const result = await service.update(paymentId, mockUpdateDto);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_UPDATE_FAILED);
    });
  });

  describe('checkout', () => {
    const paymentId = 'some-uuid';
    const statusToUpdate = StatusType.PAID;

    const mockUpdatedPayment = {
      id: paymentId,
      cpf: '12345678901',
      description: 'Test payment',
      amount: 100,
      paymentMethod: PaymentType.PIX,
      status: statusToUpdate,
    };

    it('should update the payment status successfully', async () => {
      mockPrismaService.payment.update.mockResolvedValue(mockUpdatedPayment);

      const result = await service.webhook({ id: paymentId, status: statusToUpdate });

      expect(mockPrismaService.payment.update).toHaveBeenCalledWith({
        where: { id: paymentId },
        data: { status: statusToUpdate },
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGE.PAYMENT_UPDATE_STATUS_SUCCESS);
      expect(result.data).toEqual(mockUpdatedPayment);
    });

    it('should return a bad request message on generic error', async () => {
      const genericError = new Error('Generic error');
      mockPrismaService.payment.update.mockRejectedValue(genericError);

      const result = await service.webhook({ id: paymentId, status: statusToUpdate });

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_UPDATE_STATUS_FAILED);
    });
  });

  describe('findAll', () => {
    it('should find payments successfully', async () => {
      const mockPayments = [
        { id: '1', cpf: '123' },
        { id: '2', cpf: '456' },
      ];
      mockPrismaService.payment.findMany.mockResolvedValue(mockPayments);
      const result = await service.findAll('12345678901', PaymentType.PIX);

      expect(mockPrismaService.payment.findMany).toHaveBeenCalledWith({
        where: { cpf: '12345678901', paymentMethod: PaymentType.PIX },
        select: {
          amount: true,
          cpf: true,
          description: true,
          id: true,
          paymentMethod: true,
          status: true,
        },
      });
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

  describe('findOne', () => {
    it('should find a payment successfully', async () => {
      const paymentId = 'some-uuid';
      const mockPayment = { id: paymentId, cpf: '123' };

      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      const result = await service.findOne(paymentId);

      expect(mockPrismaService.payment.findUnique).toHaveBeenCalledWith({
        where: { id: paymentId },
        select: {
          amount: true,
          cpf: true,
          description: true,
          id: true,
          paymentMethod: true,
          status: true,
        },
      });
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe(MESSAGE.PAYMENT_FOUND);
      expect(result.data).toEqual(mockPayment);
    });

    it('should return a not found message if payment is not found', async () => {
      const paymentId = 'some-uuid';
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      const result = await service.findOne(paymentId);

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(MESSAGE.PAYMENT_NOT_FOUND);
      expect(result.data).toEqual({});
    });

    it('should return a bad request message on generic error', async () => {
      const paymentId = 'some-uuid';
      mockPrismaService.payment.findUnique.mockRejectedValue(new Error());
      const result = await service.findOne(paymentId);

      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.message).toBe(MESSAGE.PAYMENT_FIND_FAILED);
    });
  });
});
