import { BadRequestException, Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { ErrorCodesEnum } from '../../common/http-errors';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async findByUsername(username: string): Promise<UserEntity | null> {
    return this.dataSource.manager.findOne(UserEntity, { where: { username } });
  }

  async insertOrFail(entity: UserEntity): Promise<UserEntity | null> {
    const existing = await this.dataSource.manager.findOne(UserEntity, {
      where: { username: entity.username },
    });
    if (existing) {
      throw new BadRequestException({ code: ErrorCodesEnum.userExists });
    }
    const result = await this.dataSource.transaction(async (em) => {
      return em.insert(UserEntity, entity);
    });
    return this.dataSource.manager.findOne(UserEntity, {
      where: { id: result.identifiers[0].id },
    });
  }
}
