import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@app/common';
import * as Joi from 'joi';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MercadoPagoService } from '../integrations/mercadopago.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        API_NAME: Joi.string().required(),
        API_PREFIX: Joi.string().required(),
        APP_PAYMENT: Joi.string().required(),
        CORS_ENABLED: Joi.string().required(),
        CORS_ALLOWED_ORIGINS: Joi.string().required(),
        CORS_ALLOWED_HEADERS: Joi.string().required(),
        CORS_ALLOWED_METHODS: Joi.string().required(),
        CORS_MAX_AGE: Joi.string().required(),
        CORS_CREDENTIALS: Joi.string().required(),
        PORT: Joi.number().default(5000),
        SWAGGER_ENABLED: Joi.string().required(),
        SWAGGER_PREFIX: Joi.string().required(),
        SWAGGER_TITLE: Joi.string().required(),
        SWAGGER_VERSION: Joi.string().required(),
        SWAGGER_DESCRIPTION: Joi.string().required(),
        SWAGGER_ENDPOINT: Joi.string().required(),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        DATABASE_URL: Joi.string().required(),
      }),
      envFilePath: './apps/payment/.env',
    }),
    PrismaModule,
  ],
  exports: [],
  controllers: [PaymentController],
  providers: [PaymentService, MercadoPagoService],
})
export class PaymentModule {}
