import { useTcManagerFixture } from 'src/test-utils/db-fixture';
import { DataSource } from 'typeorm';
import { ProgressModule } from 'src/modules/progress/progress.module';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { useJwtMockFixture } from 'src/test-utils/jwt-mock-module';
import { TestingModuleRef } from 'src/test-utils/testing-module-ref.class';
import { AuthModule } from 'src/modules/auth/auth.module';

describe('ProgressController', () => {
  const moduleRef = new TestingModuleRef();
  const stFixture = useSupertestFixture(moduleRef);
  const jwtMock = useJwtMockFixture(moduleRef);
  const tcManager = useTcManagerFixture();
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await moduleRef.create({
      imports: [
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
          content: {},
        }),
        em.create(TeachingEntity, {
          id: 2,
          title: 'T2',
          subtitle: 'ST2',
          content: {},
        }),
      ];
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
      await em.save(users);
      await em.save(teachings);
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
          teaching: { id: 1, title: 'T1', subtitle: 'ST1', content: {} },
        },
        {
          id: 2,
          scores: [{ correctAnswersPercentage: 0.2 }],
          teaching: { id: 2, title: 'T2', subtitle: 'ST2', content: {} },
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
          teaching: { id: 1, title: 'T1', subtitle: 'ST1', content: {} },
        },
      ],
    },
  ])('$description', async ({ userId, response }) => {
    await stFixture
      .supertest()
      .get('/progress')
      .set(...jwtMock.createAuthHeader(userId))
      .expect(200)
      .expect(response);
  });
});
