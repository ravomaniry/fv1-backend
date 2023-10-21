import { Request as ExpressRequest } from 'express';
import { Controller, Get, Request } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AudioService } from './audio.service';
import { ControllerBase } from 'src/common/controller.base';

@ApiTags('Audio')
@Controller('audio')
export class AudioController extends ControllerBase {
  constructor(private readonly service: AudioService) {
    super();
  }

  @Get('url/*')
  async getUrl(@Request() req: ExpressRequest) {
    const key = req.url.substring(req.url.indexOf('/audio/url/') + 11);
    return this.service.getUrl(key);
  }
}
