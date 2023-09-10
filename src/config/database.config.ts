import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';
import * as process from 'process';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';

export const dbConfigKey = 'database';

export const dbConfig = registerAs<DataSourceOptions>(
  dbConfigKey,
  (): DataSourceOptions => ({
    type: 'mysql',
    host: process.env.DATABASE_HOST,
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.DATABASE_PORT!),
    synchronize: false,
    migrationsRun: false,
    logging: false,
    namingStrategy: new SnakeNamingStrategy(),
    // server uses compiled files with js extension
    // Tests use ts files
    entities: [join(__dirname, '../modules/*/entities/*.entity.{js,ts}')],
  }),
);
