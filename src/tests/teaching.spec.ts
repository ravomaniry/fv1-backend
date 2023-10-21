import { AuthModule } from 'src/modules/auth/auth.module';
import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import { TeachingModule } from 'src/modules/teaching/teaching.module';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { useTcManagerFixture } from 'src/test-utils/db-fixture';
import { useJwtMockFixture } from 'src/test-utils/jwt-mock-module';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { TestingModuleFactory } from 'src/test-utils/testingModuleFactory.class';
import { DataSource } from 'typeorm';

describe('TeachingModule', () => {
  const moduleFactory = new TestingModuleFactory();
  const stFixture = useSupertestFixture(moduleFactory);
  const jwtMock = useJwtMockFixture(moduleFactory);
  const tcManager = useTcManagerFixture();
  let dataSource: DataSource;

  beforeAll(async () => {
    const module = await moduleFactory.create({
      imports: [
        tcManager.createTypeOrmModule(),
        ...jwtMock.createModules(),
        TeachingModule,
        AuthModule,
      ],
    });
    dataSource = module.get(DataSource);
  });

  describe('/teaching/new', () => {
    beforeEach(async () => {
      await dataSource.transaction(async (em) => {
        const users = [
          em.create(UserEntity, { id: 1, username: 'u1', hashedPassword: '' }),
          em.create(UserEntity, { id: 2, username: 'u2', hashedPassword: '' }),
        ];
        await em.save(users);
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
        await em.save(teachings);
        const progress = em.create(ProgressEntity, {
          id: 1,
          scores: [],
          user: { id: 1 },
          teaching: { id: 1 },
        });
        await em.save(progress);
      });
    });

    it.each([
      {
        description: 'Returns one for user 1',
        userId: 1,
        response: [{ id: 2, title: 'T2', subtitle: 'ST2', chapters: [] }],
      },
      {
        description: 'Returns two for user 2',
        userId: 2,
        response: [
          { id: 1, title: 'T1', subtitle: 'ST1', chapters: [] },
          { id: 2, title: 'T2', subtitle: 'ST2', chapters: [] },
        ],
      },
    ])('$description', async ({ userId, response }) => {
      await stFixture
        .supertest()
        .get('/teaching/new')
        .set(...jwtMock.createAuthHeader(userId))
        .expect(200)
        .expect(response);
    });
  });
});
