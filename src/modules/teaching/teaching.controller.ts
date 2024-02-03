import { Controller, Get } from '@nestjs/common';
import { TeachingService } from './teaching.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeachingEntity } from './entities/teaching.entity';
import { ControllerBase } from 'src/common/controller.base';

@ApiTags('Teaching')
@Controller('teaching')
export class TeachingController extends ControllerBase {
  constructor(private readonly service: TeachingService) {
    super();
  }

  @Get('new')
  @ApiResponse({ type: TeachingEntity, isArray: true })
  @ApiOperation({ operationId: 'getNew' })
  async getNew(@GetUserId() userId: number) {
    return this.service.getNew(userId);
  }
}
