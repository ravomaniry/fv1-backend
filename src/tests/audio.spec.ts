import { ConfigModule, registerAs } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppJwtConfig, jwtConfigKey } from 'src/config/jwt.config';
import { StorageConfig, storageConfigKey } from 'src/config/storage.config';
import { AudioModule } from 'src/modules/audio/audio.module';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { useTcManagerFixture } from 'src/test-utils/db-fixture';
import {
  JwtMockModule,
  useJwtMockFixture,
} from 'src/test-utils/jwt-mock-module';
import { useSupertestFixture } from 'src/test-utils/supertestFixture';
import { TestingModuleFactory } from 'src/test-utils/testingModuleFactory.class';
import { DataSource, EntityManager } from 'typeorm';

describe('AudioModule', () => {
  const tcManager = useTcManagerFixture();
  const moduleFactory = new TestingModuleFactory();
  const stFixture = useSupertestFixture(moduleFactory);
  const jwtMock = useJwtMockFixture(moduleFactory);
  let em: EntityManager;

  beforeAll(async () => {
    const module = await moduleFactory.create({
      imports: [
        tcManager.createTypeOrmModule(),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            registerAs(
              storageConfigKey,
              (): StorageConfig => ({ audioBaseUrl: 'https://x.com/audios' }),
            ),
            registerAs(
              jwtConfigKey,
              (): AppJwtConfig => ({ secret: JwtMockModule.secret }),
            ),
          ],
        }),
        JwtModule.register({ global: true, signOptions: { expiresIn: '1h' } }),
        AudioModule,
        AuthModule,
      ],
    });
    em = module.get(DataSource).manager;
  });

  beforeEach(async () => {
    await em.save(
      em.create(UserEntity, { id: 1, username: 'x', hashedPassword: 'x' }),
    );
  });

  it('Requires auth', async () => {
    await stFixture.supertest().get('/audio/url/key1.mp3').expect(401);
  });

  it('Throws 400 if url is empty', async () => {
    await stFixture.supertest().get('/audio/url/').expect(404);
  });

  it.each([
    {
      description: 'Returns key without slash',
      url: '/audio/url/abc.mp3',
      response: 'https://x.com/audios/abc.mp3',
    },
    {
      description: 'Returns key with slash',
      url: '/audio/url/folder/abc.mp3',
      response: 'https://x.com/audios/folder/abc.mp3',
    },
    {
      description: 'Returns key with URI encoded slash',
      url: '/audio/url/folder%2Fabc.mp3',
      response: 'https://x.com/audios/folder/abc.mp3',
    },
  ])('$description', async ({ url, response }) => {
    await stFixture
      .supertest()
      .get(url)
      .set(...jwtMock.createAuthHeader(1))
      .expect(200)
      .expect({ url: response });
  });
});
