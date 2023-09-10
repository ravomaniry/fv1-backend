import { ApiProperty } from '@nestjs/swagger';

export class UserTokens {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;
}
