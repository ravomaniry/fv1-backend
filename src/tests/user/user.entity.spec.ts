import { Test } from '@nestjs/testing';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { DbTestContainerManager } from 'src/test-utils/db-test-container-manager';
import { DataSource } from 'typeorm';

describe('UserEntity', () => {
  const tcManager = new DbTestContainerManager();
  let dataSource: DataSource;

  beforeAll(async () => {
    await tcManager.startAndRunMigrations();
    const moduleRef = await Test.createTestingModule({
      imports: [tcManager.createTypeOrmModule()],
    }).compile();
    dataSource = moduleRef.get(DataSource);
  });

  it('Insert and query user', async () => {
    await dataSource.manager.transaction(async (em) => {
      await em.save(
        em.create(UserEntity, { username: 'user1', hashedPassword: 'test' }),
      );
    });
    await expect(dataSource.manager.find(UserEntity)).resolves.toEqual([
      expect.objectContaining({ username: 'user1', hashedPassword: 'test' }),
    ]);
  });

  afterAll(() => tcManager.stop());
});