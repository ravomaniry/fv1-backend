import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../../modules/auth/auth.module';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { useTcManagerFixture } from '../../test-utils/db-fixture';
import { INestApplication } from '@nestjs/common';
import { ErrorCodesEnum } from '../../common/http-errors';

describe('AuthModule', () => {
  const tcManger = useTcManagerFixture();
  let dataSource: DataSource;
  let app: INestApplication;
  const originalPw = 'password0';
  const hashedPassword =
    '174a8a2a669666eed14ae43a20b1036ab1154d14bb5831822114f63e585fd11d';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [tcManger.createTypeOrmModule(), AuthModule],
    }).compile();
    dataSource = moduleRef.get(DataSource);
    app = moduleRef.createNestApplication();
    await app.init();
  });

  describe('/login', () => {
    it.each([
      {
        payload: { username: 'user1', password: originalPw },
        responseCode: 401,
        responseBody: { code: ErrorCodesEnum.invalidCredentials },
      },
      {
        payload: { username: 'user0', password: 'wrongPassword' },
        responseCode: 401,
        responseBody: { code: ErrorCodesEnum.invalidCredentials },
      },
      {
        payload: { username: 'user0', password: originalPw },
        responseCode: 200,
        responseBody: {
          user: { id: 1, username: 'user0' },
          tokens: { accessToken: '', refreshToken: '' },
        },
      },
    ])(
      '$payload $responseCode',
      async ({ payload, responseCode, responseBody }) => {
        await dataSource.transaction(async (em) => {
          await em.save(
            em.create(UserEntity, {
              id: 1,
              username: 'user0',
              hashedPassword: hashedPassword,
            }),
          );
        });
        await supertest(app.getHttpServer())
          .post('/auth/login')
          .send(payload)
          .expect(responseCode)
          .expect((resp) =>
            expect(resp.body).toEqual(expect.objectContaining(responseBody)),
          );
      },
    );
  });

  describe('/register', () => {
    it.each([
      {
        payload: { username: 'existingUser', password: 'longPassword' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.userExists },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
      },
      {
        payload: { username: 'newUser', password: 'short' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.weakPassword },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
      },
      {
        payload: { username: 'user0', password: originalPw },
        responseCode: 201,
        responseBody: {
          user: { id: expect.any(Number), username: 'user0' },
          tokens: { accessToken: '', refreshToken: '' },
        },
        usersInDb: [
          expect.objectContaining({ username: 'existingUser' }),
          expect.objectContaining({ username: 'user0', hashedPassword }),
        ],
      },
    ])(
      '$payload $responseCode',
      async ({ payload, responseCode, responseBody, usersInDb }) => {
        await dataSource.manager.transaction(async (em) => {
          await em.save(
            em.create(UserEntity, {
              username: 'existingUser',
              hashedPassword: 'p0',
            }),
          );
        });
        await supertest(app.getHttpServer())
          .post('/auth/register')
          .send(payload)
          .expect(responseCode)
          .expect((resp) =>
            expect(resp.body).toEqual(expect.objectContaining(responseBody)),
          );
        await expect(dataSource.manager.find(UserEntity)).resolves.toEqual(
          usersInDb,
        );
      },
    );
  });

  afterAll(() => app.close());
});
