import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import * as supertest from 'supertest';
import { TestingModuleRef } from './testing-module-ref.class';

export function useSupertestFixture(moduleRef: TestingModuleRef) {
  const supertest = new SupertestFixture();

  // BeforeEach runs after the module is compiled in beforeAll
  beforeEach(() => supertest.onBeforeEach(moduleRef.instance));

  afterAll(() => supertest.close());

  return supertest;
}

export class SupertestFixture {
  private app: INestApplication;
  private isInitialized = false;

  supertest(): supertest.SuperTest<supertest.Test> {
    return supertest(this.app.getHttpServer());
  }

  async onBeforeEach(testingModule: TestingModule) {
    if (!this.isInitialized) {
      this.isInitialized = true;
      this.app = testingModule.createNestApplication();
      await this.app.init();
    }
  }

  async close() {
    await this.app.close();
  }
}
