import { registerAs } from '@nestjs/config';

export const storageConfigKey = 'storage';

export interface StorageConfig {
  audioBaseUrl: string;
}

export const storageConfig = registerAs(
  storageConfigKey,
  (): StorageConfig => ({
    audioBaseUrl: process.env.AUDIO_BASE_URL!,
  }),
);
