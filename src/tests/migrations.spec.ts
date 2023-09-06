import { Test } from '@nestjs/testing';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DbTestContainerManager } from 'src/test-utils/db-test-container-manager';
import { DataSource } from 'typeorm';

describe('Database migrations', () => {
  const tcManager = new DbTestContainerManager();
  let dataSource: DataSource;

  beforeAll(async () => {
    await tcManager.start();
    const module = await Test.createTestingModule({
      imports: [tcManager.createTypeOrmModule()],
    }).compile();
    dataSource = module.get(DataSource);
  });

  it('Runs migrations, create and select an user', async () => {
    await tcManager.runMigrations();
    await dataSource.manager.transaction(async (em) => {
      await em.save(
        em.create(UserEntity, { username: 'test', hashedPassword: 'test' }),
      );
    });
    await expect(dataSource.manager.find(UserEntity)).resolves.toEqual([
      expect.objectContaining({ username: 'test', hashedPassword: 'test' }),
    ]);
  });

  afterAll(() => tcManager.stop());
});
