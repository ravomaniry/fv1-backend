import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProgressEntity } from './entities/progress.entity';
import { StartRequestDto } from './dtos/startTeaching.dto';
import { TeachingEntity } from '../teaching/entities/teaching.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ErrorCodesEnum } from 'src/common/http-errors';

@Injectable()
export class ProgressService {
  constructor(private readonly dataSource: DataSource) {}

  async getProgresses(userId: number) {
    return this.dataSource.manager.find(ProgressEntity, {
      where: { user: { id: userId } },
      relations: { teaching: true },
    });
  }

  async start(userId: number, { teachingId }: StartRequestDto) {
    const existing = await this.dataSource.manager.findOne(ProgressEntity, {
      where: { user: { id: userId }, teaching: { id: teachingId } },
      relations: { teaching: true },
    });
    if (existing) {
      return existing;
    }
    const teaching = await this.dataSource.manager.findOne(TeachingEntity, {
      where: { id: teachingId },
    });
    if (!teaching) {
      throw new BadRequestException({
        code: ErrorCodesEnum.invalidPayload,
        message: `Teaching with id ${teachingId} does not exist`,
      });
    }
    const progress = new ProgressEntity();
    progress.scores = [];
    progress.teaching = teaching;
    progress.user = { id: userId } as UserEntity;
    await this.dataSource.manager.save(progress);
    return { ...progress, user: undefined };
  }
}
