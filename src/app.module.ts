import { Module } from '@nestjs/common';
import { SanityCheckModule } from './modules/sanity-check/sanity-check.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from './config/jwt.config';
import { dbConfig, dbConfigKey } from './config/database.config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { ProgressModule } from './modules/progress/progress.module';
import { TeachingModule } from './modules/teaching/teaching.module';
import { AudioModule } from './modules/audio/audio.module';
import { storageConfig } from './config/storage.config';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    LoggerModule.forRoot({ pinoHttp: { level: 'info' } }),
    ConfigModule.forRoot({
      load: [jwtConfig, dbConfig, storageConfig],
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
        AUDIO_BASE_URL: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<DataSourceOptions>(dbConfigKey)!,
      inject: [ConfigService],
    }),
    SanityCheckModule,
    UserModule,
    AuthModule,
    ProgressModule,
    TeachingModule,
    AudioModule,
  ],
})
export class AppModule {}
