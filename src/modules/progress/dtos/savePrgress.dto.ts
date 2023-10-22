import { ApiProperty } from '@nestjs/swagger';
import { ProgressScore } from '../entities/progress.entity';

export class SaveProgressReqDto {
  @ApiProperty({ type: ProgressScore, isArray: true })
  scores: ProgressScore[];

  @ApiProperty()
  clientTimestamp: number;
}
