import { ApiProperty } from '@nestjs/swagger';
import { ProgressScore } from '../entities/progress.entity';
import { IsInt, IsNotEmpty } from 'class-validator';

export class SaveProgressReqDto {
  @IsNotEmpty()
  @ApiProperty({ type: ProgressScore, isArray: true })
  scores: ProgressScore[];

  @IsInt()
  @ApiProperty()
  clientTimestamp: number;
}
