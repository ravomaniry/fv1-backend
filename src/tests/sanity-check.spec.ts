import { SanityCheckModule } from '../modules/sanity-check/sanity-check.module';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { TestingModuleFactory } from 'src/test-utils/testingModuleFactory.class';

describe('SanityCheckModule', () => {
  const moduleRef = new TestingModuleFactory();
  const fixture = useSupertestFixture(moduleRef);

  beforeAll(async () => {
    await moduleRef.create({ imports: [SanityCheckModule] });
  });

  it('Responds 200', async () => {
    await fixture.supertest().get('/sanity-check').expect(200);
  });
});
