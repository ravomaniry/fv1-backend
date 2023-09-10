import { registerAs } from '@nestjs/config';
import { AppJwtConfig } from './jwt-config.interface';
import * as process from 'process';

export const jwtConfigKey = 'jwt';

export const jwtConfig = registerAs(
  jwtConfigKey,
  (): AppJwtConfig => ({
    secret: process.env.JWT_SECRET!,
  }),
);
