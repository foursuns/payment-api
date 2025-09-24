import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger, NestApplicationOptions, ValidationPipe, VersioningType } from '@nestjs/common';
import { HttpExceptionFilter, SwaggerDocumentBuilder } from '@app/common';
import { PaymentModule } from './payment.module';
import helmet from 'helmet';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(PaymentModule, {
    logger: new Logger(process.env.APP_PAYMENT),
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(helmet());
  app.enableShutdownHooks();

  const configService = app.get(ConfigService);

  app.setGlobalPrefix(configService.get('API_PREFIX'));

  const allowedOrigins = configService
    .get('CORS_ALLOWED_ORIGINS')
    ?.split(',')
    .map((o: string) => o.trim());

  if (configService.get('CORS_ENABLED')) {
    const corsOptionsEnv: NestApplicationOptions['cors'] = {
      origin: allowedOrigins,
      allowedHeaders: configService
        .get('CORS_ALLOWED_HEADERS')
        ?.split(',')
        .map((h: string) => h.trim()),
      methods: configService
        .get('CORS_ALLOWED_METHODS')
        ?.split(',')
        .map((m: string) => m.trim()),
      credentials: configService.get('CORS_CREDENTIALS') === 'true',
      maxAge: configService.get('CORS_MAX_AGE', 10),
    };
    app.enableCors(corsOptionsEnv);
    Logger.log(`🚨 CORS enabled with origins: ${allowedOrigins.join(', ')}`);
  } else {
    Logger.log(`❌ CORS is disabled`);
  }

  if (configService.get('SWAGGER_ENABLED')) {
    const swaggerBuild = new SwaggerDocumentBuilder(app);
    swaggerBuild.setupSwagger();
    Logger.log(`📗 Swagger is running`);
  } else {
    Logger.log(`❌ Swagger is disabled`);
  }

  await app.listen(configService.get('PORT') ?? 5000, async (): Promise<void> => {
    Logger.log(`🚀 Application running on port ${configService.get('PORT') ?? 5000}`);
  });

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
    Logger.log(`❌ Application stopping on port ${configService.get('PORT') ?? 5000}`);
  }
}

(async (): Promise<void> => await bootstrap())();
