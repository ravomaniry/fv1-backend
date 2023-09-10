import { Module } from '@nestjs/common';
import { SanityCheckModule } from './modules/sanity-check/sanity-check.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './modules/auth/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfig } from './config/jwt.congig';
import { dbConfig, dbConfigKey } from './config/database.config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig, dbConfig],
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        DATABASE_HOST: Joi.string().required(),
        DATABASE_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DATABASE: Joi.string().required(),
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
  ],
  providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
})
export class AppModule {}
