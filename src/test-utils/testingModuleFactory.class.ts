import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';

type Interceptor = (mr: TestingModuleBuilder) => TestingModuleBuilder;

export class TestingModuleFactory {
  private _instance: TestingModule;

  get instance() {
    return this._instance;
  }

  async create(
    metadata: ModuleMetadata,
    interceptor?: Interceptor,
  ): Promise<TestingModule> {
    let builder = Test.createTestingModule(metadata);
    if (interceptor) {
      builder = interceptor(builder);
    }
    this._instance = await builder.compile();
    return this._instance;
  }
}
