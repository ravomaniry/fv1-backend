import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { GetUserId } from '../auth/auth.annotations';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StartRequestDto } from './dtos/startTeaching.dto';
import { ControllerBase } from 'src/common/controller.base';
import { ProgressEntity } from './entities/progress.entity';
import { SaveProgressReqDto } from './dtos/savePrgress.dto';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController extends ControllerBase {
  constructor(private readonly service: ProgressService) {
    super();
  }

  @Get('')
  @ApiResponse({ type: ProgressEntity, isArray: true })
  @ApiOperation({ operationId: 'getProgresses' })
  async getProgresses(@GetUserId() userId: number) {
    return this.service.getProgresses(userId);
  }

  @Post('start')
  @ApiResponse({ type: ProgressEntity })
  @ApiOperation({ operationId: 'start' })
  async start(@GetUserId() userId: number, @Body() body: StartRequestDto) {
    return this.service.start(userId, body);
  }

  @Put('save/:id')
  @ApiOperation({ operationId: 'save' })
  async save(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SaveProgressReqDto,
    @GetUserId() userId: number,
  ) {
    await this.service.save(id, userId, body);
    return {};
  }

  @Put('sync/:id')
  @ApiOperation({ operationId: 'sync' })
  async sync(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: SaveProgressReqDto,
    @GetUserId() userId: number,
  ) {
    await this.service.sync(id, userId, body);
    return {};
  }
}
