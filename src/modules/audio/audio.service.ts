import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageConfig, storageConfigKey } from 'src/config/storage.config';
import { GetAudioUrlResp } from './dtos/audioUrl.dto';

@Injectable()
export class AudioService {
  private readonly audioBaseUrl: string;

  constructor(configService: ConfigService) {
    this.audioBaseUrl =
      configService.get<StorageConfig>(storageConfigKey)!.audioBaseUrl;
  }

  async getUrl(key: string): Promise<GetAudioUrlResp> {
    return {
      url: `${this.audioBaseUrl}/${key}`,
    };
  }
}
