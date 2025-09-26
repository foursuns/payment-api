import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PaymentService } from '../payments/payment.service';
import { CreatePaymentDto, UpdatePaymentDto } from './dto/payment.dto';
import { QueryDto } from './dto/query.dto';
import { PaymentType } from '@prisma/client';

@Controller({ version: '1', path: 'payments' })
@ApiTags('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiBody({ type: CreatePaymentDto, description: 'Payment Information' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Access' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() paymentDto: CreatePaymentDto) {
    return await this.paymentService.create(paymentDto);
  }

  @Post('webhooks/mercadopago')
  @HttpCode(HttpStatus.OK)
  async webhook(@Body() webhookDto: any) {
    await this.paymentService.webhook(webhookDto);
    return { received: true };
  }

  @Put(':id')
  @ApiBody({ type: UpdatePaymentDto, description: 'Payment Information' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Access' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() paymentDto: UpdatePaymentDto) {
    return await this.paymentService.update(id, paymentDto);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Found successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Access' })
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.paymentService.findOne(id);
  }

  @Get()
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({ description: 'Found successfully' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized Access' })
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryDto) {
    const cpf = query.cpf;
    const method = query.method as PaymentType;
    return await this.paymentService.findAll(cpf, method);
  }
}
