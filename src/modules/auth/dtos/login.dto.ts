import { ApiProperty, PickType } from '@nestjs/swagger';
import { UserEntity } from '../../user/entities/user.entity';
import { UserTokens } from './user-tokens.dto';
import { IsNotEmpty } from 'class-validator';

export class UiUserModel extends PickType(UserEntity, ['id', 'username']) {}

export class LoginRequestDto {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  username: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  password: string;
}

export class LoginResponseDto {
  @ApiProperty()
  user: UiUserModel;

  @ApiProperty()
  tokens: UserTokens;
}
