import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  const swaggerDoc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().addBearerAuth().setTitle('Fv1').build(),
  );
  SwaggerModule.setup('docs', app, swaggerDoc);
  app.enableCors({ origin: '*' });
  await app.listen(3000);
}
bootstrap();
