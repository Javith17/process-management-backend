import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = express()
  app.enableCors({
    allowedHeaders: ['content-type', 'Authorization'],
    origin: ['http://localhost:3000','http://localhost:3001', 'http://localhost:3002', 'https://confiengg.co.in'],
    methods:'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['Authorization'],
    credentials: true
  });
  await app.listen(3000);
  // await expressApp.listen(3002)
  // expressApp.get(
  //   '/quotation_doc',
  //   async(
  //     req: express.Request,
  //     res: express.Response,
  //     next: express.NextFunction
  //   ) => {
  //     res.send("Success")
  //   }
  // )
}
bootstrap();
