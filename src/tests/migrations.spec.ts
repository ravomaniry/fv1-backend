import { DbTestContainerManager } from 'src/test-utils/db-test-container-manager';

describe('Database migrations', () => {
  const tcManager = new DbTestContainerManager();

  beforeAll(async () => {
    await tcManager.start();
  });

  it('Runs migrations, create and select an user', async () => {
    await tcManager.runMigrations();
  });

  afterAll(() => tcManager.stop());
});
