import { Module } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dbConfig, dbConfigKey } from 'src/config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';

@Module({
  providers: [SeederService],
  imports: [
    ConfigModule.forRoot({ load: [dbConfig], isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<DataSourceOptions>(dbConfigKey)!,
      inject: [ConfigService],
    }),
  ],
})
export class SeederModule {}
