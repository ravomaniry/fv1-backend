import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { LoginRequestDto, LoginResponseDto } from './dtos/login.dto';
import { UserEntity } from './entities/user.entity';
import { DataSource } from 'typeorm';
import { ErrorCodesEnum } from '../../common/http-errors';
import { RegisterRequestDto } from './dtos/register.dto';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    const pwd = this.hashPassword(dto);
    const user = await this.dataSource.manager.findOne(UserEntity, {
      select: ['id', 'username'],
      where: {
        username: dto.username,
        hashedPassword: pwd,
      },
    });
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodesEnum.invalidCredentials,
      });
    }
    const tokens = await this.authService.generateTokens(user);
    return { user, tokens };
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

  async register(dto: RegisterRequestDto): Promise<LoginResponseDto> {
    if (this.passwordIsWeak(dto.password)) {
      throw new BadRequestException({ code: ErrorCodesEnum.weakPassword });
    }
    const existing = await this.dataSource.manager.findOne(UserEntity, {
      where: { username: dto.username },
    });
    if (existing) {
      throw new BadRequestException({ code: ErrorCodesEnum.userExists });
    }
    const user = await this.dataSource.transaction(async (em) => {
      return em.save(
        em.create(UserEntity, {
          username: dto.username,
          hashedPassword: this.hashPassword(dto),
        }),
      );
    });
    const tokens = await this.authService.generateTokens(user);
    return {
      user: { id: user.id, username: user.username },
      tokens,
    };
  }

  private passwordIsWeak(pwd: string) {
    return pwd.length < 8;
  }
}
