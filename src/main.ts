import "dotenv/config";
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe)

  const config = new DocumentBuilder()
    .setTitle('NestJS auth rest api')
    .setDescription('API documentation for auth rest api pet project')
    .setVersion('1.0.0')
    .setContact('Dmitry Melnikov', 'https://t.me/MelnikovD99', 'd.melnikov.dev@gmail.com')
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('/swagger', app, document)

  app.enableShutdownHooks();
  await app.listen(process.env.PORT!);
}
await bootstrap();
