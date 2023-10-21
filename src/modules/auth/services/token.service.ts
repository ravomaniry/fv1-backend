import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { UserTokens } from '../dtos/user-tokens.dto';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { RefreshTokenEntity } from '../entities/refresh-token.entity';
import { ErrorCodesEnum } from '../../../common/http-errors';
import { ConfigService } from '@nestjs/config';
import { jwtConfigKey, AppJwtConfig } from '../../../config/jwt.config';

@Injectable()
export class TokenService {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<AppJwtConfig>(jwtConfigKey)!.secret;
  }

  async generate(user: UserEntity): Promise<UserTokens> {
    const accessToken = await this.generateAccessToken(user);
    return {
      accessToken: accessToken,
      refreshToken: await this.generateAnsStoreRefreshToken(user.id),
    };
  }

  async refreshAccessToken(refreshToken: string) {
    const stored = await this.dataSource.manager.findOne(RefreshTokenEntity, {
      where: { id: refreshToken },
      relations: { user: true },
    });
    if (!stored) {
      throw new UnauthorizedException({
        code: ErrorCodesEnum.invalidCredentials,
      });
    }
    return this.generateAccessToken(stored.user);
  }

  private async generateAnsStoreRefreshToken(userId: number) {
    const id = await this.jwtService.signAsync(
      { sub: userId, issuedAt: new Date().getTime() },
      { secret: this.jwtSecret },
    );
    await this.dataSource.manager.transaction((em) =>
      em.insert(
        RefreshTokenEntity,
        em.create(RefreshTokenEntity, {
          id,
          user: { id: userId },
        }),
      ),
    );
    return id;
  }

  private generateAccessToken(user: UserEntity) {
    return this.jwtService.signAsync(
      { sub: user.id },
      { secret: this.jwtSecret },
    );
  }
}
