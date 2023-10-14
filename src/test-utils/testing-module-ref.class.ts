import { ModuleMetadata } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

export class TestingModuleRef {
  private _instance: TestingModule;

  get instance() {
    return this._instance;
  }

  async create(metadata: ModuleMetadata): Promise<TestingModule> {
    this._instance = await Test.createTestingModule(metadata).compile();
    return this._instance;
  }
}
