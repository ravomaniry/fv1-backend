import { Test } from '@nestjs/testing';
import { TeachingEntity } from 'src/modules/teaching/entities/teaching.entity';
import { DbTestContainerManager } from 'src/test-utils/db-test-container-manager';
import { DataSource } from 'typeorm';

describe('TeachingEntity', () => {
  const tcManager = new DbTestContainerManager();
  let dataSource: DataSource;

  beforeAll(async () => {
    await tcManager.startAndRunMigrations();
    const moduleRef = await Test.createTestingModule({
      imports: [tcManager.createTypeOrmModule()],
    }).compile();
    dataSource = moduleRef.get(DataSource);
  });

  it('Inserts and query teaching', async () => {
    await dataSource.manager.transaction((em) =>
      em.save(
        em.create(TeachingEntity, {
          title: 'test',
          subtitle: 'ST',
          content: { hello: true },
        }),
      ),
    );
    await expect(dataSource.manager.find(TeachingEntity)).resolves.toEqual([
      expect.objectContaining({
        title: 'test',
        subtitle: 'ST',
        content: { hello: true },
      }),
    ]);
  });

  afterAll(() => tcManager.stop());
});
