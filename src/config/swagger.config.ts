import { DocumentBuilder } from "@nestjs/swagger";

export function getSwaggerConfig() {
    return new DocumentBuilder()
        .setTitle('Auth API')
        .setDescription('Rest API for NestJS auth project')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build()
}