import { Controller, Get } from '@nestjs/common';
import { TeachingService } from './teaching.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ControllerBase } from 'src/common/controller.base';
import { NewTeachingRespDto } from './dto/NewTeaching.dto';

@ApiTags('Teaching')
@Controller('teaching')
export class TeachingController extends ControllerBase {
  constructor(private readonly service: TeachingService) {
    super();
  }

  @Get('new')
  @ApiResponse({ type: NewTeachingRespDto, isArray: true })
  @ApiOperation({ operationId: 'getNew' })
  async getNew(@GetUserId() userId: number) {
    return this.service.getNew(userId);
  }
}
