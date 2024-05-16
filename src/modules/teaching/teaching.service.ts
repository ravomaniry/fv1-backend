import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TeachingEntity } from './entities/teaching.entity';
import { ProgressEntity } from '../progress/entities/progress.entity';
import { NewTeachingRespDto } from './dto/NewTeaching.dto';

@Injectable()
export class TeachingService {
  constructor(private readonly dataSource: DataSource) {}

  async getNew(userId: number): Promise<NewTeachingRespDto[]> {
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
            .where('progress.user_id = :userId', { userId })
            .getQuery()
        );
      })
      .getMany();
  }

  async getRandomSampleTeachings(): Promise<NewTeachingRespDto[]> {
    return this.dataSource.manager.find(TeachingEntity, {
      select: ['id', 'title', 'subtitle'],
      order: { id: 'DESC' },
      take: 10,
    });
  }
}
