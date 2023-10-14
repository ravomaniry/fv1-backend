import { SanityCheckModule } from '../modules/sanity-check/sanity-check.module';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { TestingModuleRef } from 'src/test-utils/testing-module-ref.class';

describe('SanityCheckModule', () => {
  const moduleRef = new TestingModuleRef();
  const fixture = useSupertestFixture(moduleRef);

  beforeAll(async () => {
    await moduleRef.create({ imports: [SanityCheckModule] });
  });

  it('Responds 200', async () => {
    await fixture.supertest().get('/sanity-check').expect(200);
  });
});
