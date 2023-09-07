import { Test } from '@nestjs/testing';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { useTcManagerFixture } from 'src/test-utils/db-fixture';
import { DataSource } from 'typeorm';

describe('Run database migrations', () => {
  const tcManager = useTcManagerFixture();

  it('Runs migrations, create and query users table', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [tcManager.createTypeOrmModule()],
    }).compile();
    const ds = moduleRef.get(DataSource);
    await expect(ds.manager.find(UserEntity)).resolves.toEqual([]);
  });
});
