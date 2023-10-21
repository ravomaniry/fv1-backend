import { Controller, Get } from '@nestjs/common';
import { TeachingService } from './teaching.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Teaching')
@Controller('teaching')
export class TeachingController {
  constructor(private readonly service: TeachingService) {}

  @Get('new')
  async getNew(@GetUserId() userId: number) {
    return this.service.getNew(userId);
  }
}
