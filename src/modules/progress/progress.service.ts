import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ProgressEntity } from './entities/progress.entity';
import { StartRequestDto } from './dtos/startTeaching.dto';
import { TeachingEntity } from '../teaching/entities/teaching.entity';
import { UserEntity } from '../user/entities/user.entity';
import { ErrorCodesEnum } from 'src/common/http-errors';
import { SaveProgressReqDto } from './dtos/savePrgress.dto';
import { Logger } from 'nestjs-pino';

@Injectable()
export class ProgressService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

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
    progress.clientTimestamp = 0;
    await this.dataSource.manager.save(progress);
    return { ...progress, user: undefined };
  }

  async save(progressId: number, userId: number, reqBody: SaveProgressReqDto) {
    const progress = await this.dataSource.manager.findOne(ProgressEntity, {
      where: { user: { id: userId }, id: progressId },
    });
    if (!progress) {
      throw new BadRequestException('Progress not found');
    }
    await this.updateProgress(progress, reqBody);
  }

  async sync(progressId: number, userId: number, reqBody: SaveProgressReqDto) {
    const progress = await this.dataSource.manager.findOne(ProgressEntity, {
      where: { id: progressId },
      loadRelationIds: {
        disableMixedMap: true,
        relations: ['user', 'teaching'],
      },
    });
    if (!progress) {
      return;
    }
    if (progress.user.id !== userId) {
      const newProgress = this.dataSource.manager.create(ProgressEntity, {
        scores: reqBody.scores,
        clientTimestamp: reqBody.clientTimestamp,
        user: { id: userId },
        teaching: { id: progress.teaching.id },
      });
      await this.dataSource.manager.save(newProgress);
      this.logger.log('Copied progress for new user');
    } else if (progress.clientTimestamp < reqBody.clientTimestamp) {
      await this.updateProgress(progress, reqBody);
      this.logger.log('Updated progress');
    }
  }

  private async updateProgress(
    progress: ProgressEntity,
    reqBody: SaveProgressReqDto,
  ) {
    progress.scores = reqBody.scores;
    progress.clientTimestamp = reqBody.clientTimestamp;
    await this.dataSource.manager.save(progress);
  }
}
