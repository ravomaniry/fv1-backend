import { Controller, Get } from '@nestjs/common';
import { TeachingService } from './teaching.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeachingEntity } from './entities/teaching.entity';

@ApiTags('Teaching')
@Controller('teaching')
export class TeachingController {
  constructor(private readonly service: TeachingService) {}

  @Get('new')
  @ApiResponse({ type: TeachingEntity, isArray: true })
  async getNew(@GetUserId() userId: number) {
    return this.service.getNew(userId);
  }
}
