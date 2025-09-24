import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
export class SwaggerDocumentBuilder {
  constructor(private readonly app: INestApplication<any>) {}

  private buildConfig() {
    return new DocumentBuilder()
      .setTitle(process.env.SWAGGER_TITLE)
      .setDescription(process.env.SWAGGER_DESCRIPTION)
      .setVersion(process.env.SWAGGER_VERSION)
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'Authorization',
        description: 'Enter your Bearer token',
      })
      .addSecurityRequirements('bearer')
      .build();
  }

  public setupSwagger() {
    const config = this.buildConfig();
    const document = SwaggerModule.createDocument(this.app, config);
    SwaggerModule.setup(process.env.SWAGGER_ENDPOINT, this.app, document);
  }
}
