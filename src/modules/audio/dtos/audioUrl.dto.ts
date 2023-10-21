import { ApiProperty } from '@nestjs/swagger';

export class GetAudioUrlResp {
  @ApiProperty()
  url: string;
}
