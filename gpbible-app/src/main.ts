import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global pipes for validation
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('GPBible API')
    .setDescription('API documentation for GPBible application')
    .setVersion('1.0')
    .addTag('Authentication', 'Authentication endpoints')
    .addTag('Google Authentication', 'Google OAuth endpoints')
    .addTag('Users', 'User management endpoints')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
