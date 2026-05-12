import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.enableCors({
  //   origin: ['http://localhost:3000','http://localhost:3001', 'http://localhost:3002', 'https://confiengg.co.in'],
  //   methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   allowedHeaders: '*',
  //   exposedHeaders: ['Authorization'],
  //   credentials: true
  // });
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'https://confiengg.co.in',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin); // 👈 return exact origin
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  });

  await app.listen(3000, '0.0.0.0');
}
bootstrap();
