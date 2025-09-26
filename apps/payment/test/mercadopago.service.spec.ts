import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { MercadoPagoService } from './../src/integrations/mercadopago.service';
import { MESSAGE } from '@app/common';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockConfigService = {
  get: jest.fn(key => {
    switch (key) {
      case 'MERCADOPAGO_API_URL':
        return 'https://api.mercadopago.com';
      case 'MERCADOPAGO_ACCESS_TOKEN':
        return 'TEST_ACCESS_TOKEN';
      case 'MERCADOPAGO_WEBHOOK':
        return 'https://my-webhook.com/callback';
      default:
        return null;
    }
  }),
};

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let mockHttp: jest.Mocked<AxiosInstance>;

  const mockCheckoutData = {
    items: {
      cpf: '12345678901',
      description: 'Teste de produto',
      quantity: 1,
      unit_price: 150.5,
    },
  };

  const mockMpResponseData = {
    id: 'MP-12345',
    init_point: 'https://mp.com/checkout/MP-12345',
    sandbox_init_point: 'https://sandbox.mp.com/checkout/MP-12345',
  };

  beforeEach(async () => {
    mockHttp = {
      post: jest.fn(),
      defaults: {},
    } as unknown as jest.Mocked<AxiosInstance>;

    mockedAxios.create.mockReturnValue(mockHttp);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockedAxios.create).toHaveBeenCalledWith({
      baseURL: 'https://api.mercadopago.com',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer TEST_ACCESS_TOKEN',
      },
      httpsAgent: expect.any(Object),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkout', () => {
    it('should successfully call Mercado Pago API and return success message', async () => {
      mockHttp.post.mockResolvedValue({ data: mockMpResponseData, status: 201 } as AxiosResponse);

      const result = await service.checkout(mockCheckoutData);
      const expectedRequestBody = {
        items: [
          {
            id: 'payment-item-id',
            title: mockCheckoutData.items.description,
            description: mockCheckoutData.items.description,
            picture_url: 'https://www.myapp.com/myimage.jpg',
            category_id: 'car_electronics',
            quantity: mockCheckoutData.items.quantity,
            currency_id: 'BRL',
            unit_price: mockCheckoutData.items.unit_price,
          },
        ],
        payer: {
          email: 'test@mercadopago.com',
          identification: {
            type: 'CPF',
            number: mockCheckoutData.items.cpf,
          },
          name: 'John',
          surname: 'Doe',
          phone: { area_code: '11', number: 988888888 },
          address: { zip_code: '06233200', street_name: 'Example Street', street_number: 123 },
        },
        back_urls: {
          success: 'https://test.com/success',
          pending: 'https://test.com/pending',
          failure: 'https://test.com/failure',
        },
        notification_url: 'https://my-webhook.com/callback',
        auto_return: 'approved',
        external_reference: '1643827245',
        expires: false,
      };

      expect(mockHttp.post).toHaveBeenCalledWith('/checkout/preferences', expectedRequestBody);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe(MESSAGE.MERCADOPAGO_CREATE_SUCCESS);
      expect(result.data).toEqual(mockMpResponseData);
    });

    it('should handle AxiosError and return internal server error message', async () => {
      const errorResponse = { status: 400, data: { message: 'Invalid request data' } };
      const axiosError = {
        isAxiosError: true,
        response: errorResponse,
        message: 'Request failed with status code 400',
        config: {},
      } as AxiosError;
      mockHttp.post.mockRejectedValue(axiosError);

      const result = await service.checkout(mockCheckoutData);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe(MESSAGE.MERCADOPAGO_CREATE_FAILED);
      expect(result.data).toEqual(errorResponse.data); // Retorna os dados do response de erro
    });

    it('should handle generic error without response and return internal server error message', async () => {
      const genericError = new Error('Network error');

      mockHttp.post.mockRejectedValue(genericError);

      const result = await service.checkout(mockCheckoutData);

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe(MESSAGE.MERCADOPAGO_CREATE_FAILED);
      expect(result.data).toBe('Network error');
    });
  });
});
