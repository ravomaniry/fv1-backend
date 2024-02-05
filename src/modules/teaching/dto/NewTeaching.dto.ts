import { PickType } from '@nestjs/swagger';
import { TeachingEntity } from '../entities/teaching.entity';

export class NewTeachingRespDto extends PickType(TeachingEntity, [
  'id',
  'title',
  'subtitle',
]) {}
