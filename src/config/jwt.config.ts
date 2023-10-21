import { registerAs } from '@nestjs/config';
import * as process from 'process';

export const jwtConfigKey = 'jwt';

export interface AppJwtConfig {
  secret: string;
}

export const jwtConfig = registerAs(
  jwtConfigKey,
  (): AppJwtConfig => ({
    secret: process.env.JWT_SECRET!,
  }),
);
