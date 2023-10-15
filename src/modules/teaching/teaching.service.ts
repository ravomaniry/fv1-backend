import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TeachingEntity } from './entities/teaching.entity';
import { ProgressEntity } from '../progress/entities/progress.entity';

@Injectable()
export class TeachingService {
  constructor(private readonly dataSource: DataSource) {}

  async getNew(userId: number) {
    return this.dataSource.manager
      .getRepository(TeachingEntity)
      .createQueryBuilder('teaching')
      .where((qb) => {
        return (
          'teaching.id NOT IN ' +
          qb
            .subQuery()
            .select('progress.teaching_id')
            .from(ProgressEntity, 'progress')
            .where('progress.user_id = :userId')
            .getQuery()
        );
      })
      .setParameter('userId', userId)
      .getMany();
  }
}
