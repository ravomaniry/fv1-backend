import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { SanityCheckModule } from '../modules/sanity-check/sanity-check.module';
import * as supertest from 'supertest';

describe('SanityCheckModule', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [SanityCheckModule],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  it('Responds 200', async () => {
    await supertest(app.getHttpServer()).get('/sanity-check').expect(200);
  });

  afterAll(() => app.close());
});
