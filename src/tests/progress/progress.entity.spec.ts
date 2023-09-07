import { Test } from '@nestjs/testing';
import { ProgressEntity } from 'src/modules/progress/entities/progress.entity';
import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DbTestContainerManager } from 'src/test-utils/db-test-container-manager';
import { DataSource } from 'typeorm';

describe('ProgressEntity', () => {
  const tcManager = new DbTestContainerManager();
  let dataSource: DataSource;

  beforeAll(async () => {
    await tcManager.startAndRunMigrations();
    const moduleRef = await Test.createTestingModule({
      imports: [tcManager.createTypeOrmModule()],
    }).compile();
    dataSource = moduleRef.get(DataSource);
  });

  it('Inserts and select progress with foreign keys', async () => {
    await expect(
      dataSource.transaction((em) => em.save(em.create(ProgressEntity, {}))),
    ).rejects.toThrowError();
    await dataSource.transaction(async (em) => {
      await em.save(
        em.create(UserEntity, { id: 1, username: 'x', hashedPassword: 'x' }),
      );
      await em.save(
        em.create(TeachingEntity, {
          id: 10,
          title: 'x',
          subtitle: 'x',
          content: {},
        }),
      );
      await em.save(
        em.create(ProgressEntity, {
          id: 1,
          teaching: { id: 10 },
          user: { id: 1 },
          scores: [{ correctAnswersPercentage: 1 }],
        }),
      );
    });
    await expect(dataSource.manager.find(ProgressEntity)).resolves.toEqual([
      expect.objectContaining({
        id: 1,
        scores: [{ correctAnswersPercentage: 1 }],
      }),
    ]);
    await expect(
      dataSource.manager.find(ProgressEntity, {
        relations: { teaching: true, user: true },
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 1,
        scores: [{ correctAnswersPercentage: 1 }],
        user: expect.objectContaining({ id: 1, username: 'x' }),
        teaching: expect.objectContaining({ id: 10, title: 'x' }),
      }),
    ]);
  });

  afterAll(() => tcManager.stop());
});
