import * as supertest from 'supertest';
import { DataSource } from 'typeorm';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../../modules/auth/auth.module';
import { UserEntity } from '../../modules/user/entities/user.entity';
import { useTcManagerFixture } from '../../test-utils/db-fixture';
import { INestApplication } from '@nestjs/common';
import { ErrorCodesEnum } from '../../common/http-errors';
import { RefreshTokenEntity } from '../../modules/auth/entities/refresh-token.entity';
import { UserTokens } from '../../modules/auth/dtos/user-tokens.dto';
import { JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../modules/auth/auth.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigKey } from '../../config/jwt.congig';

describe('AuthModule', () => {
  const tcManger = useTcManagerFixture();
  let dataSource: DataSource;
  let app: INestApplication;
  let jwtService: JwtService;
  let server: any;
  const originalPw = 'password0';
  const hashedPassword =
    '174a8a2a669666eed14ae43a20b1036ab1154d14bb5831822114f63e585fd11d';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        tcManger.createTypeOrmModule(),
        AuthModule,
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthGuard }],
    })
      .overrideProvider(ConfigService)
      .useValue(new Map([[jwtConfigKey, { secret: 'SECRET' }]]))
      .compile();
    dataSource = moduleRef.get(DataSource);
    jwtService = moduleRef.get(JwtService);
    app = moduleRef.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  describe('/login', () => {
    it.each([
      {
        payload: {},
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.invalidPayload },
        refreshTokensInDb: 0,
      },
      {
        payload: { username: '', password: '' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.invalidPayload },
        refreshTokensInDb: 0,
      },
      {
        payload: { username: 'user1', password: originalPw },
        responseCode: 401,
        responseBody: { code: ErrorCodesEnum.invalidCredentials },
        refreshTokensInDb: 0,
      },
      {
        payload: { username: 'user0', password: 'wrongPassword' },
        responseCode: 401,
        responseBody: { code: ErrorCodesEnum.invalidCredentials },
        refreshTokensInDb: 0,
      },
      {
        payload: { username: 'user0', password: originalPw },
        responseCode: 200,
        responseBody: {
          user: { id: 1, username: 'user0' },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          },
        },
        refreshTokensInDb: 1,
      },
    ])(
      '$payload $responseCode',
      async ({ payload, responseCode, responseBody, refreshTokensInDb }) => {
        await dataSource.transaction(async (em) => {
          await em.save(
            em.create(UserEntity, {
              id: 1,
              username: 'user0',
              hashedPassword: hashedPassword,
            }),
          );
        });
        await supertest(server)
          .post('/auth/login')
          .send(payload)
          .expect(responseCode)
          .expect((resp) =>
            expect(resp.body).toEqual(expect.objectContaining(responseBody)),
          );
        await expect(
          dataSource.manager.find(RefreshTokenEntity),
        ).resolves.toHaveLength(refreshTokensInDb);
      },
    );
  });

  describe('/register', () => {
    it.each([
      {
        payload: { username: '', password: 'longPassword' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.invalidPayload },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
        refreshTokensInDb: 0,
      },
      {
        payload: { username: 'existingUser', password: 'longPassword' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.userExists },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
        refreshTokensInDb: 0,
      },
      {
        payload: { username: 'newUser', password: 'short' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.weakPassword },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
        refreshTokensInDb: 0,
      },
      {
        payload: { username: 'user0', password: originalPw },
        responseCode: 201,
        responseBody: {
          user: { id: expect.any(Number), username: 'user0' },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          },
        },
        usersInDb: [
          expect.objectContaining({ username: 'existingUser' }),
          expect.objectContaining({ username: 'user0', hashedPassword }),
        ],
        refreshTokensInDb: 1,
      },
    ])(
      '$payload $responseCode',
      async ({
        payload,
        responseCode,
        responseBody,
        usersInDb,
        refreshTokensInDb,
      }) => {
        await dataSource.manager.transaction(async (em) => {
          await em.save(
            em.create(UserEntity, {
              username: 'existingUser',
              hashedPassword: 'p0',
            }),
          );
        });
        await supertest(server)
          .post('/auth/register')
          .send(payload)
          .expect(responseCode)
          .expect((resp) =>
            expect(resp.body).toEqual(expect.objectContaining(responseBody)),
          );
        await expect(dataSource.manager.find(UserEntity)).resolves.toEqual(
          usersInDb,
        );
        await expect(
          dataSource.manager.find(RefreshTokenEntity),
        ).resolves.toHaveLength(refreshTokensInDb);
      },
    );
  });

  it('Register guest user', async () => {
    await supertest(server)
      .post('/auth/register-guest')
      .send({})
      .expect(201)
      .expect((res) =>
        expect(res.body).toEqual({
          user: expect.objectContaining({
            id: expect.any(Number),
            username: expect.any(String),
          }),
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          },
        }),
      );
    await expect(dataSource.manager.find(UserEntity)).resolves.toHaveLength(1);
    await expect(
      dataSource.manager.find(RefreshTokenEntity),
    ).resolves.toHaveLength(1);
  });

  it('Generates, validates and refresh access token', async () => {
    const manager = dataSource.manager;
    let user: Partial<UserEntity>;
    let tokens: UserTokens;
    let refreshedTokens: UserTokens;
    await dataSource.transaction(async (em) => {
      await em.save(
        em.create(UserEntity, {
          id: 1,
          username: 'user0',
          hashedPassword: hashedPassword,
        }),
      );
    });
    await supertest(server)
      .post('/auth/login')
      .send({ username: 'user0', password: originalPw })
      .expect(200)
      .expect((res) => {
        tokens = res.body.tokens;
        user = res.body.user;
      });
    await expect(
      manager.find(RefreshTokenEntity, {
        where: { id: tokens!.refreshToken },
      }),
    ).resolves.toEqual([{ id: tokens!.refreshToken, userId: 1 }]);
    // Log out fails when no token is provided
    await supertest(server).post('/auth/logout').expect(401);
    /// Refresh token
    // fails if token is not found
    await supertest(server)
      .post('/auth/refresh-token')
      .send({ token: jwtService.sign({}, { secret: 'Wrong secret' }) })
      .expect(401);
    // Fails if payload is invalid
    await supertest(server).post('/auth/refresh-token').send({}).expect(400);
    // Succeed when token is found
    await supertest(server)
      .post('/auth/refresh-token')
      .send({ token: tokens!.refreshToken })
      .expect(201)
      .expect((res) => {
        refreshedTokens = res.body;
        expect(refreshedTokens).toEqual({
          accessToken: expect.any(String),
          refreshToken: tokens!.refreshToken,
        });
      });
    // do not create new refresh token
    await expect(
      manager.find(RefreshTokenEntity, {
        where: { id: tokens!.refreshToken },
      }),
    ).resolves.toEqual([{ id: tokens!.refreshToken, userId: user!.id }]);
    /// Log out
    await dataSource.transaction(async (em) => {
      await em.save(
        em.create(UserEntity, { id: 2, username: 'u1', hashedPassword: 'p0' }),
      );
      await em.save(
        em.create(RefreshTokenEntity, {
          id: 'anotherToken',
          user: { id: 2 },
        }),
      );
    });
    // Logout fails when token is invalid
    const invalidToken = jwtService.sign(
      { sub: user!.id },
      { secret: 'Wrong secret' },
    );
    await supertest(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    // Logout with a valid token
    await expect(manager.find(RefreshTokenEntity)).resolves.toHaveLength(2);
    await supertest(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens!.accessToken}`)
      .expect(201);
    await expect(manager.find(RefreshTokenEntity)).resolves.toEqual([
      expect.objectContaining({ id: 'anotherToken' }),
    ]);
    // Logout API call still succeeds but it does nothing
    await supertest(server)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshedTokens!.accessToken}`)
      .expect(201);
    await expect(manager.find(RefreshTokenEntity)).resolves.toHaveLength(1);
  });

  afterAll(() => app.close());
});
