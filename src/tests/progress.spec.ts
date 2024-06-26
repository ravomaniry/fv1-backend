import { useTcManagerFixture } from 'src/test-utils/db-fixture';
import { DataSource } from 'typeorm';
import { ProgressModule } from 'src/modules/progress/progress.module';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { useJwtMockFixture } from 'src/test-utils/jwt-mock-module';
import { TestingModuleFactory } from 'src/test-utils/testingModuleFactory.class';
import { AuthModule } from 'src/modules/auth/auth.module';
import { ErrorCodesEnum } from 'src/common/http-errors';
import { SaveProgressReqDto } from 'src/modules/progress/dtos/savePrgress.dto';
import { LoggerModule } from 'nestjs-pino';

describe('ProgressController', () => {
  const moduleFactory = new TestingModuleFactory();
  const stFixture = useSupertestFixture(moduleFactory);
  const jwtMock = useJwtMockFixture(moduleFactory);
  const tcManager = useTcManagerFixture();
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await moduleFactory.create({
      imports: [
        LoggerModule.forRoot(),
        tcManager.createTypeOrmModule(),
        ...jwtMock.createModules(),
        ProgressModule,
        AuthModule,
      ],
    });
    dataSource = module.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.transaction(async (em) => {
      const users = [
        em.create(UserEntity, { id: 1, username: 'u1', hashedPassword: '' }),
        em.create(UserEntity, { id: 2, username: 'u2', hashedPassword: '' }),
        em.create(UserEntity, { id: 3, username: 'u3', hashedPassword: '' }),
      ];
      const teachings = [
        em.create(TeachingEntity, {
          id: 1,
          title: 'T1',
          subtitle: 'ST1',
          chapters: [],
        }),
        em.create(TeachingEntity, {
          id: 2,
          title: 'T2',
          subtitle: 'ST2',
          chapters: [],
        }),
      ];
      await em.save(users);
      await em.save(teachings);
    });
  });

  describe('/progress', () => {
    beforeEach(async () => {
      await dataSource.transaction(async (em) => {
        const progresses = [
          em.create(ProgressEntity, {
            id: 1,
            user: { id: 1 },
            teaching: { id: 1 },
            scores: [{ correctAnswersPercentage: 0.1 }],
          }),
          em.create(ProgressEntity, {
            id: 2,
            user: { id: 1 },
            teaching: { id: 2 },
            scores: [{ correctAnswersPercentage: 0.2 }],
          }),
          em.create(ProgressEntity, {
            id: 3,
            user: { id: 2 },
            teaching: { id: 1 },
            scores: [{ correctAnswersPercentage: 0.3 }],
          }),
        ];
        await em.save(progresses);
      });
    });
    it.each([
      {
        description: 'Returns empty array if user is not found',
        userId: 3,
        response: [],
      },
      {
        description: 'Returns 2 items for user 1',
        userId: 1,
        response: [
          {
            id: 1,
            scores: [{ correctAnswersPercentage: 0.1 }],
            teaching: { id: 1, title: 'T1', subtitle: 'ST1', chapters: [] },
            clientTimestamp: 0,
          },
          {
            id: 2,
            scores: [{ correctAnswersPercentage: 0.2 }],
            teaching: { id: 2, title: 'T2', subtitle: 'ST2', chapters: [] },
            clientTimestamp: 0,
          },
        ],
      },
      {
        description: 'Returns 1 for user 2',
        userId: 2,
        response: [
          {
            id: 3,
            scores: [{ correctAnswersPercentage: 0.3 }],
            teaching: { id: 1, title: 'T1', subtitle: 'ST1', chapters: [] },
            clientTimestamp: 0,
          },
        ],
      },
    ])('$description', async ({ userId, response }) => {
      await stFixture
        .supertest()
        .get('/progress')
        .set(...jwtMock.createAuthHeader(userId))
        .expect(200)
        .expect((res) => expect(res.body).toEqual(response));
    });
  });

  describe('/progress/start', () => {
    beforeEach(async () => {
      await dataSource.manager.transaction(async (em) => {
        const progress = em.create(ProgressEntity, {
          id: 1,
          scores: [{ correctAnswersPercentage: 0.1 }],
          teaching: { id: 1 },
          user: { id: 1 },
        });
        await em.save(progress);
      });
    });

    it.each([
      {
        description: 'Validates request body',
        userId: 1,
        reqBody: {},
        statusCode: 400,
        response: expect.objectContaining({
          code: ErrorCodesEnum.invalidPayload,
        }),
        progresseAfterUpdate: [expect.objectContaining({ id: 1 })],
      },
      {
        description: 'Return existing progress if it already exists',
        userId: 1,
        reqBody: { teachingId: 1 },
        statusCode: 201,
        response: {
          id: 1,
          scores: [{ correctAnswersPercentage: 0.1 }],
          clientTimestamp: 0,
          teaching: { id: 1, title: 'T1', subtitle: 'ST1', chapters: [] },
        },
        progresseAfterUpdate: [expect.objectContaining({ id: 1 })],
      },
      {
        description: 'Create new progress and return',
        userId: 1,
        reqBody: { teachingId: 2 },
        statusCode: 201,
        response: {
          id: expect.any(Number),
          scores: [],
          clientTimestamp: 0,
          teaching: { id: 2, title: 'T2', subtitle: 'ST2', chapters: [] },
        },
        progresseAfterUpdate: [
          expect.objectContaining({ id: 1 }),
          expect.objectContaining({
            user: { id: 1 },
            clientTimestamp: 0,
            teaching: { id: 2 },
          }),
        ],
      },
    ])(
      '$description',
      async ({
        userId,
        reqBody,
        statusCode,
        response,
        progresseAfterUpdate,
      }) => {
        await stFixture
          .supertest()
          .post('/progress/start')
          .set(...jwtMock.createAuthHeader(userId))
          .send(reqBody)
          .expect(statusCode)
          .expect((res) => expect(res.body).toEqual(response));
        await expect(
          dataSource.manager.find(ProgressEntity, {
            loadRelationIds: {
              disableMixedMap: true,
              relations: ['user', 'teaching'],
            },
          }),
        ).resolves.toEqual(progresseAfterUpdate);
      },
    );
  });

  describe('/progress/save', () => {
    beforeEach(async () => {
      await dataSource.transaction(async (em) => {
        await em.save(
          em.create(ProgressEntity, {
            id: 10,
            scores: [],
            teaching: { id: 1 },
            user: { id: 1 },
          }),
        );
      });
    });

    it.each([
      {
        description: 'Invalid request body',
        progressId: 100,
        userId: 1,
        body: <Partial<SaveProgressReqDto>>{ scores: [] },
        responseCode: 400,
        progressesAfterUpdate: [expect.objectContaining({})],
      },
      {
        description: 'Invalid request body',
        progressId: 10,
        userId: 1,
        body: <Partial<SaveProgressReqDto>>{ clientTimestamp: 1000 },
        responseCode: 400,
        progressesAfterUpdate: [expect.objectContaining({})],
      },
      {
        description: 'Progress does not belong to current user',
        progressId: 10,
        userId: 2,
        body: <SaveProgressReqDto>{
          scores: [{ correctAnswersPercentage: 0.5 }],
          clientTimestamp: 1000,
        },
        responseCode: 400,
        progressesAfterUpdate: [
          expect.objectContaining({ id: 10, scores: [] }),
        ],
      },
      {
        description: 'Updates the progress with the data received from API',
        progressId: 10,
        userId: 1,
        body: <SaveProgressReqDto>{
          clientTimestamp: 1000,
          scores: [{ correctAnswersPercentage: 0.5 }],
        },
        responseCode: 200,
        progressesAfterUpdate: [
          expect.objectContaining({
            id: 10,
            clientTimestamp: 1000,
            scores: [{ correctAnswersPercentage: 0.5 }],
          }),
        ],
      },
    ])(
      '$description',
      async ({
        userId,
        progressId,
        body,
        responseCode,
        progressesAfterUpdate,
      }) => {
        await stFixture
          .supertest()
          .put(`/progress/save/${progressId}`)
          .set(...jwtMock.createAuthHeader(userId))
          .send(body)
          .expect(responseCode);
        await expect(dataSource.manager.find(ProgressEntity)).resolves.toEqual(
          progressesAfterUpdate,
        );
      },
    );
  });

  describe('/progress/sync', () => {
    beforeEach(async () => {
      await dataSource.transaction(async (em) => {
        await em.save(
          em.create(ProgressEntity, {
            id: 10,
            scores: [],
            teaching: { id: 1 },
            user: { id: 1 },
            clientTimestamp: 1000,
          }),
        );
      });
    });

    it.each([
      {
        description: 'Progress does not belong to current user',
        progressId: 10,
        userId: 2,
        body: <SaveProgressReqDto>{
          scores: [{ correctAnswersPercentage: 0.5 }],
          clientTimestamp: 1000,
        },
        responseCode: 200,
        progressesAfterUpdate: [
          expect.objectContaining({ id: 10, scores: [] }),
          expect.objectContaining({
            scores: [{ correctAnswersPercentage: 0.5 }],
            clientTimestamp: 1000,
            user: { id: 2 },
            teaching: { id: 1 },
          }),
        ],
      },
      {
        description: 'Version from client is older',
        progressId: 10,
        userId: 1,
        body: <SaveProgressReqDto>{
          scores: [{ correctAnswersPercentage: 0.5 }],
          clientTimestamp: 900,
        },
        responseCode: 200,
        progressesAfterUpdate: [
          expect.objectContaining({
            id: 10,
            scores: [],
            clientTimestamp: 1000,
          }),
        ],
      },
      {
        description: 'Updates the progress with the data received from API',
        progressId: 10,
        userId: 1,
        body: <SaveProgressReqDto>{
          clientTimestamp: 1001,
          scores: [{ correctAnswersPercentage: 0.5 }],
        },
        responseCode: 200,
        progressesAfterUpdate: [
          expect.objectContaining({
            id: 10,
            clientTimestamp: 1001,
            scores: [{ correctAnswersPercentage: 0.5 }],
          }),
        ],
      },
    ])(
      '$description',
      async ({
        userId,
        progressId,
        body,
        responseCode,
        progressesAfterUpdate,
      }) => {
        await stFixture
          .supertest()
          .put(`/progress/sync/${progressId}`)
          .set(...jwtMock.createAuthHeader(userId))
          .send(body)
          .expect(responseCode);
        await expect(
          dataSource.manager.find(ProgressEntity, {
            loadRelationIds: {
              disableMixedMap: true,
              relations: ['user', 'teaching'],
            },
          }),
        ).resolves.toEqual(progressesAfterUpdate);
      },
    );
  });
});
