import { DbTestContainerManager } from './db-test-container-manager';

export function useTcManagerFixture() {
  const tcManager = new DbTestContainerManager();

  beforeAll(async () => tcManager.start());

  beforeEach(async () => tcManager.runMigrations());

  afterEach(() => tcManager.deleteAllTables());

  afterAll(() => tcManager.stop());

  return tcManager;
}
