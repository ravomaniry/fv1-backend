import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.setGlobalPrefix('api');
  const swaggerDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().addBearerAuth().setTitle('Fv1').build(),
  );
  SwaggerModule.setup('api/docs', app, swaggerDoc);
  app.enableCors({ origin: '*' });
  app.useLogger(app.get(Logger));
  await app.listen(3000);
}
bootstrap();
