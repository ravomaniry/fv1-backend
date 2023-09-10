import { Injectable } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { UserTokens } from './types/user-tokens.interface';

@Injectable()
export class AuthService {
  async generateTokens(user: UserEntity): Promise<UserTokens> {
    console.log(user);
    return { accessToken: '', refreshToken: '' };
  }
}
