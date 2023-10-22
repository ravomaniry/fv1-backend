import { Request as ExpressRequest } from 'express';
import { Controller, Get, Request } from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AudioService } from './audio.service';
import { ControllerBase } from 'src/common/controller.base';
import { GetAudioUrlResp } from './dtos/audioUrl.dto';

@ApiTags('Audio')
@Controller('audio')
export class AudioController extends ControllerBase {
  constructor(private readonly service: AudioService) {
    super();
  }

  @Get('url/:key*')
  @ApiParam({ name: 'key', type: String })
  @ApiResponse({ type: GetAudioUrlResp })
  async getUrl(@Request() req: ExpressRequest) {
    const id = req.url.substring(req.url.indexOf(`/audio/url/`) + 11);
    return this.service.getUrl(decodeURIComponent(id));
  }
}
