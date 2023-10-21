import { Body, Controller, Get, Post } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { StartRequestDto } from './dtos/startTeaching.dto';
import { ControllerBase } from 'src/common/controller.base';
import { ProgressEntity } from './entities/progress.entity';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController extends ControllerBase {
  constructor(private readonly service: ProgressService) {
    super();
  }

  @Get('')
  @ApiResponse({ type: ProgressEntity, isArray: true })
  async getProgresses(@GetUserId() userId: number) {
    return this.service.getProgresses(userId);
  }

  @Post('start')
  @ApiResponse({ type: ProgressEntity })
  async start(@GetUserId() userId: number, @Body() body: StartRequestDto) {
    return this.service.start(userId, body);
  }
}
