import { Injectable, Logger } from '@nestjs/common';
import { promises } from 'fs';
import { join } from 'path';
import { cwd } from 'process';
import { DataSource } from 'typeorm';
import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';

@Injectable()
export class SeederService {
  constructor(private readonly dataSouce: DataSource) {}

  async run() {
    const logger = new Logger('SeederService');
    const dir = join(cwd(), 'teachings');
    const fileNames = await promises.readdir(dir);
    for (const fileName of fileNames) {
      const path = join(dir, fileName);
      const content = JSON.parse(await promises.readFile(path, 'utf-8'));
      const teaching = this.dataSouce.manager.create(TeachingEntity, content);
      await this.dataSouce.manager.save(teaching);
      logger.log(`Saved ${fileName}`);
    }
    logger.log('Done.');
  }
}
