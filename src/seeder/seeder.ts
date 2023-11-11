import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder.module';
import { SeederService } from './seeder.service';

(async () => {
  const app = await NestFactory.createApplicationContext(SeederModule);
  await app.get(SeederService).run();
  await app.close();
})();
