import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash } from 'crypto';
import { LoginRequestDto } from './dtos/login.dto';
import { UserEntity } from './entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(private readonly dataSource: DataSource) {}

  async getByCredentials(dto: LoginRequestDto): Promise<UserEntity | null> {
    const pwd = this.hashPassword(dto);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      select: ['id', 'username'],
      where: {
        username: dto.username,
        hashedPassword: pwd,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return user;
  }

  private hashPassword({ username, password }: LoginRequestDto) {
    return this.hashString(
      this.combineHashes(this.hashString(username), this.hashString(password)),
    );
  }

  private hashString(str: string): string {
    return createHash('sha256').update(str).update(str).digest('hex');
  }

  private combineHashes(hash1: string, hash2: string) {
    let combined = '';
    for (let i = 0; i < hash1.length; i++) {
      combined += i % 2 == 0 ? hash1[i] : hash2[i];
    }
    return combined;
  }
}
