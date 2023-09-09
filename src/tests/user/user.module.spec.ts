import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { UserModule } from '../../modules/user/user.module';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { useTcManagerFixture } from '../../test-utils/db-fixture';
import { INestApplication } from '@nestjs/common';

describe('UserModule', () => {
  const tcManger = useTcManagerFixture();
  let dataSource: DataSource;
  let app: INestApplication;
  const originalPw = 'password0';
  const hashOfPw =
    '174a8a2a669666eed14ae43a20b1036ab1154d14bb5831822114f63e585fd11d';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [tcManger.createTypeOrmModule(), UserModule],
    }).compile();
    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  it.each([
    {
      payload: { username: 'user1', password: originalPw },
      responseCode: 401,
      responseBody: {
        statusCode: 401,
        message: 'Invalid credentials.',
        error: 'Unauthorized',
      },
    },
    {
      payload: { username: 'user0', password: 'wrongPassword' },
      responseCode: 401,
      responseBody: {
        statusCode: 401,
        message: 'Invalid credentials.',
        error: 'Unauthorized',
      },
    },
    {
      payload: { username: 'user0', password: originalPw },
      responseCode: 200,
      responseBody: { id: 1, username: 'user0' },
    },
  ])('Login: %o', async ({ payload, responseCode, responseBody }) => {
    await dataSource.transaction(async (em) => {
      await em.save(
        em.create(UserEntity, {
          id: 1,
          username: 'user0',
          hashedPassword: hashOfPw,
        }),
      );
    });
    await supertest(app.getHttpServer())
      .post('/user/login')
      .send(payload)
      .expect(responseCode)
      .expect(responseBody);
  });

  afterAll(() => app.close());
});
