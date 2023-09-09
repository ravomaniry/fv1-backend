import { Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export class DbTestContainerManager {
  private container: MySqlContainer;
  private startedContainer: StartedMySqlContainer;
  private readonly logger = new Logger('DbTestContainerManager');
  private internalDataSource: DataSource;

  constructor() {
    this.container = new MySqlContainer('mysql:8.1.0').withDatabase('fv1');
  }

  async start(): Promise<void> {
    this.startedContainer = await this.container.start();
    this.internalDataSource = new DataSource({
      ...this.getDbCredentials(),
      migrations: [this.joinWithRootDir('src/migrations/*.ts')],
    });
    await this.internalDataSource.initialize();
    this.logger.log(`Db started ${this.startedContainer.getPort()}`);
  }

  createTypeOrmModule() {
    return TypeOrmModule.forRoot({
      ...this.getDbCredentials(),
      synchronize: false,
      migrationsRun: false,
      namingStrategy: new SnakeNamingStrategy(),
    });
  }

  private getDbCredentials() {
    return {
      type: 'mysql' as const,
      host: this.startedContainer.getHost(),
      port: this.startedContainer.getPort(),
      database: this.startedContainer.getDatabase(),
      username: this.startedContainer.getUsername(),
      password: this.startedContainer.getUserPassword(),
      entities: [this.joinWithRootDir('src/modules/*/entities/*.entity.ts')],
    };
  }

  private joinWithRootDir(relativePath: string) {
    return join(__dirname, '../..', relativePath);
  }

  async runMigrations() {
    try {
      await this.internalDataSource.runMigrations();
      this.logger.log('Migrations executed');
    } catch (error) {
      this.logger.error('Unable to execute migrations.');
      throw new Error('Unable to execute migrations ' + error);
    }
  }

  async startAndRunMigrations() {
    await this.start();
    await this.runMigrations();
  }

  /**
   * This can be used in afterEach to re-create the database.
   * It's faster than starting a new container
   */
  async deleteAllTables() {
    const dbName = this.startedContainer.getDatabase();
    await this.internalDataSource.query(`DROP DATABASE ${dbName}`);
    await this.internalDataSource.query(`CREATE DATABASE ${dbName}`);
    await this.internalDataSource.query(`USE ${dbName}`);
    this.logger.log('All tables are deleted');
  }

  async stop() {
    await this.internalDataSource?.destroy();
    this.logger.log('Connection closed.');
    await this.startedContainer?.stop();
    this.logger.log('Container stopped.');
  }
}
