import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProgressEntity } from './entities/progress.entity';

@Injectable()
export class ProgressService {
  constructor(private readonly dataSource: DataSource) {}

  async getProgresses(userId: number) {
    return this.dataSource.manager.find(ProgressEntity, {
      where: { user: { id: userId } },
      relations: { teaching: true },
    });
  }
}
