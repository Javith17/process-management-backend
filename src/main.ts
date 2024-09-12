import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    allowedHeaders: ['content-type', 'Authorization'],
    origin: ['http://localhost:3000','http://localhost:3001', 'http://localhost:3002'],
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Authorization'],
    credentials: true
  });
  await app.listen(3000);
}
bootstrap();
