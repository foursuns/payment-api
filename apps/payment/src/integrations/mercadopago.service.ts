import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as https from 'https';
import { customMessage, MESSAGE, ResponseDto } from '@app/common';

@Injectable()
export class MercadoPagoService {
  private readonly baseUrl = this.configService.get<string>('MERCADOPAGO_API_URL');
  private http: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.http = axios.create({
      httpsAgent: new https.Agent({}),
    });
  }

  async checkout(checkoutData: any): Promise<ResponseDto> {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.configService.get('MERCADOPAGO_ACCESS_TOKEN')}`,
    };

    const requestBody = {
      items: [
        {
          id: 'Sound system',
          title: 'Dummy Title',
          description: checkoutData.items.description,
          picture_url: 'https://www.myapp.com/myimage.jpg',
          category_id: 'car_electronics',
          quantity: checkoutData.items.quantity,
          currency_id: 'BRL',
          unit_price: checkoutData.items.unit_price,
        },
      ],
      payer: {
        name: 'John',
        surname: 'Doe',
        email: 'john@doe.com',
        phone: {
          area_code: '11',
          number: 988888888,
        },
        identification: {
          type: 'CPF',
          number: checkoutData.items.cpf,
        },
        address: {
          zip_code: '06233200',
          street_name: 'Example Street',
          street_number: 123,
        },
        date_created: '2024-04-01T00:00:00Z',
      },
      payment_methods: {
        excluded_payment_methods: [
          {
            id: 'master',
          },
        ],
        excluded_payment_types: [
          {
            id: 'ticket',
          },
        ],
        default_payment_method_id: 'amex',
        installments: 10,
        default_installments: 5,
      },
      shipments: {
        local_pickup: false,
        dimensions: '32 x 25 x 16',
        default_shipping_method: null,
        free_methods: [
          {
            id: null,
          },
        ],
        cost: 20,
        free_shipping: false,
        receiver_address: {
          zip_code: '72549555',
          street_name: 'Street address test',
          city_name: 'São Paulo',
          state_name: 'São Paulo',
          street_number: 100,
          country_name: 'Brazil',
        },
      },
      back_urls: {
        success: 'https://test.com/success',
        pending: 'https://test.com/pending',
        failure: 'https://test.com/failure',
      },
      notification_url: 'http://payment/api/v1/webhooks/mercadopago',
      additional_info: 'Discount 12.00',
      auto_return: 'approved',
      external_reference: '1643827245',
      expires: false,
      expiration_date_from: '2022-11-17T09:37:52.000-04:00',
      expiration_date_to: '2022-11-17T10:37:52.000-05:00',
      marketplace: 'NONE',
      marketplace_fee: 0,
      differential_pricing: {
        id: 1,
      },
      tracks: [],
      metadata: null,
    };

    try {
      const response = await this.http.post(`${this.baseUrl}`, requestBody, {
        headers,
      });
      return customMessage(HttpStatus.CREATED, MESSAGE.MERCADOPAGO_CREATE_SUCCESS, response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      return customMessage(
        HttpStatus.INTERNAL_SERVER_ERROR,
        MESSAGE.MERCADOPAGO_CREATE_FAILED,
        axiosError.response?.data || axiosError.message,
      );
    }
  }
}
