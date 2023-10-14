import { Controller, Get } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('')
  async getProgresses(@GetUserId() userId: number) {
    return this.service.getProgresses(userId);
  }
}
