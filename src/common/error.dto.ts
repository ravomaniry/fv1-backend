import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodesEnum } from 'src/common/http-errors';

export class BaseErrorResponseDto {
  @ApiProperty({ enum: ErrorCodesEnum, enumName: 'ErrorCodesEnum' })
  code: ErrorCodesEnum;
}
