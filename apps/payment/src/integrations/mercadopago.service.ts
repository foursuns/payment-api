import { Injectable, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosError } from 'axios';
import * as https from 'https';
import { customMessage, MESSAGE, ResponseDto } from '@app/common';

interface CheckoutItemsDto {
  cpf: string;
  description: string;
  quantity: number;
  unit_price: number;
}

@Injectable()
export class MercadoPagoService {
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly notificationUrl: string;
  private http: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('MERCADOPAGO_API_URL');
    this.accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    this.notificationUrl = this.configService.get<string>('MERCADOPAGO_WEBHOOK');

    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
      },
      httpsAgent: new https.Agent({}),
    });
  }

  async checkout(checkoutData: { items: CheckoutItemsDto }): Promise<ResponseDto> {
    const { cpf, description, quantity, unit_price } = checkoutData.items;

    const createRequestBody = () => ({
      items: [
        {
          id: 'payment-item-id',
          title: description,
          description,
          picture_url: 'https://www.myapp.com/myimage.jpg',
          category_id: 'car_electronics',
          quantity,
          currency_id: 'BRL',
          unit_price,
        },
      ],
      payer: {
        email: 'test@mercadopago.com',
        identification: {
          type: 'CPF',
          number: cpf,
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
      notification_url: this.notificationUrl,
      auto_return: 'approved',
      external_reference: '1643827245',
      expires: false,
    });

    try {
      const response = await this.http.post('/checkout/preferences', createRequestBody());
      return customMessage(HttpStatus.CREATED, MESSAGE.MERCADOPAGO_CREATE_SUCCESS, response.data);
    } catch (error) {
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data || axiosError.message;
      return customMessage(
        HttpStatus.INTERNAL_SERVER_ERROR,
        MESSAGE.MERCADOPAGO_CREATE_FAILED,
        errorMessage,
      );
    }
  }
}
