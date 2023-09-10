import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';
import { UserTokens } from '../types/user-tokens.interface';

export class LoginRequestDto {
  @ApiProperty({ required: true })
  username: string;

  @ApiProperty({ required: true })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  user: Pick<UserEntity, 'id' | 'username'>;

  @ApiProperty()
  tokens: UserTokens;
}
