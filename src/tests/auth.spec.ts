import { DataSource } from 'typeorm';
import { AuthModule } from '../modules/auth/auth.module';
import { UserEntity } from '../modules/user/entities/user.entity';
import { useTcManagerFixture } from '../test-utils/db-fixture';
import { ErrorCodesEnum } from '../common/http-errors';
import { RefreshTokenEntity } from '../modules/auth/entities/refresh-token.entity';
import { UserTokens } from '../modules/auth/dtos/user-tokens.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { jwtConfigKey } from '../config/jwt.config';
import { TestingModuleFactory } from 'src/test-utils/testingModuleFactory.class';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { ConvertToNamedAccountReqDto } from 'src/modules/auth/dtos/convert-to-named-account.dto';

describe('AuthModule', () => {
  const tcManger = useTcManagerFixture();
  const moduleFactory = new TestingModuleFactory();
  const stFixture = useSupertestFixture(moduleFactory);
  let dataSource: DataSource;
  let jwtService: JwtService;
  const originalPw = 'password0';
  const hashedPassword =
    '174a8a2a669666eed14ae43a20b1036ab1154d14bb5831822114f63e585fd11d';

  beforeAll(async () => {
    const module = await moduleFactory.create(
      {
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          tcManger.createTypeOrmModule(),
          AuthModule,
        ],
      },
      (bl) =>
        bl
          .overrideProvider(ConfigService)
          .useValue(new Map([[jwtConfigKey, { secret: 'SECRET' }]])),
    );
    dataSource = module.get(DataSource);
    jwtService = module.get(JwtService);
  });

  describe('/login', () => {
    beforeEach(async () => {
      await dataSource.transaction(async (em) => {
        await em.save(
          em.create(UserEntity, {
            id: 1,
            username: 'user0',
            hashedPassword: hashedPassword,
          }),
        );
      });
    });

    it.each([
      {
        description: 'Properties are required',
        payload: {},
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.invalidPayload },
        refreshTokensInDb: 0,
      },
      {
        description: 'Empty strings are invalid',
        payload: { username: '', password: '' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.invalidPayload },
        refreshTokensInDb: 0,
      },
      {
        description: 'Wrong username',
        payload: { username: 'user1', password: originalPw },
        responseCode: 401,
        responseBody: { code: ErrorCodesEnum.invalidCredentials },
        refreshTokensInDb: 0,
      },
      {
        description: 'Wrong password 2',
        payload: { username: 'user0', password: 'wrongPassword' },
        responseCode: 401,
        responseBody: { code: ErrorCodesEnum.invalidCredentials },
        refreshTokensInDb: 0,
      },
      {
        description: 'Correct credentials',
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
      '$description - $responseCode',
      async ({ payload, responseCode, responseBody, refreshTokensInDb }) => {
        await stFixture
          .supertest()
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
    beforeEach(async () => {
      await dataSource.manager.transaction(async (em) => {
        await em.save(
          em.create(UserEntity, {
            username: 'existingUser',
            hashedPassword: 'p0',
          }),
        );
      });
    });

    it.each([
      {
        description: 'Empty username',
        payload: { username: '', password: 'longPassword' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.invalidPayload },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
        refreshTokensInDb: 0,
      },
      {
        description: 'Duplicate username',
        payload: { username: 'existingUser', password: 'longPassword' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.userExists },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
        refreshTokensInDb: 0,
      },
      {
        description: 'Weak password',
        payload: { username: 'newUser', password: 'short' },
        responseCode: 400,
        responseBody: { code: ErrorCodesEnum.weakPassword },
        usersInDb: [expect.objectContaining({ username: 'existingUser' })],
        refreshTokensInDb: 0,
      },
      {
        description: 'New user',
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
      '$description - $responseCode',
      async ({
        payload,
        responseCode,
        responseBody,
        usersInDb,
        refreshTokensInDb,
      }) => {
        await stFixture
          .supertest()
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
    await stFixture
      .supertest()
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
    await stFixture
      .supertest()
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
        loadRelationIds: { disableMixedMap: true, relations: ['user'] },
      }),
    ).resolves.toEqual([{ id: tokens!.refreshToken, user: { id: 1 } }]);
    // Log out fails when no token is provided
    await stFixture.supertest().post('/auth/logout').expect(401);
    /// Refresh token
    // fails if token is not found
    await stFixture
      .supertest()
      .post('/auth/refresh-token')
      .send({ token: jwtService.sign({}, { secret: 'Wrong secret' }) })
      .expect(401);
    // Fails if payload is invalid
    await stFixture
      .supertest()
      .post('/auth/refresh-token')
      .send({})
      .expect(400);
    // Succeed when token is found
    await stFixture
      .supertest()
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
        loadRelationIds: { disableMixedMap: true, relations: ['user'] },
      }),
    ).resolves.toEqual([{ id: tokens!.refreshToken, user: { id: user!.id } }]);
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
    await stFixture
      .supertest()
      .post('/auth/logout')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401);
    // Logout with a valid token
    await expect(manager.find(RefreshTokenEntity)).resolves.toHaveLength(2);
    await stFixture
      .supertest()
      .post('/auth/logout')
      .set('Authorization', `Bearer ${tokens!.accessToken}`)
      .expect(201);
    await expect(manager.find(RefreshTokenEntity)).resolves.toEqual([
      expect.objectContaining({ id: 'anotherToken' }),
    ]);
    // Logout API call still succeeds but it does nothing
    await stFixture
      .supertest()
      .post('/auth/logout')
      .set('Authorization', `Bearer ${refreshedTokens!.accessToken}`)
      .expect(201);
    await expect(manager.find(RefreshTokenEntity)).resolves.toHaveLength(1);
  });

  describe('Convert anonymous to named account', () => {
    interface TestScenario {
      description: string;
      responseCode: number;
      response: any;
      reqBody: ConvertToNamedAccountReqDto;
      updatedUsers: Partial<UserEntity>[];
    }

    beforeEach(async () => {
      await dataSource.manager.insert(UserEntity, {
        id: 1,
        username: '1111',
        hashedPassword: '',
      });
    });

    it.each<TestScenario>([
      {
        description: 'Returns error if the password is weak',
        reqBody: { username: 'user0', password: 'short' },
        responseCode: 400,
        response: { code: ErrorCodesEnum.weakPassword },
        updatedUsers: [{ id: 1, username: '1111' }],
      },
      {
        description: 'Update user and returns the new user tokens',
        reqBody: { username: 'user0', password: originalPw },
        responseCode: 200,
        response: {
          user: { id: 1, username: 'user0' },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String),
          },
        },
        updatedUsers: [
          {
            id: 1,
            username: 'user0',
            hashedPassword: hashedPassword,
          },
        ],
      },
    ])('$description', async (scenario) => {
      await stFixture
        .supertest()
        .put('/auth/convert-to-named-account')
        .set(
          'Authorization',
          `Bearer ${jwtService.sign({ sub: 1 }, { secret: 'SECRET' })}`,
        )
        .send(scenario.reqBody)
        .expect(scenario.responseCode)
        .expect((res) => expect(res.body).toEqual(scenario.response));
      await expect(dataSource.manager.find(UserEntity)).resolves.toMatchObject(
        scenario.updatedUsers,
      );
    });
  });
});
