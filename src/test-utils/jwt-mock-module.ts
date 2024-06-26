import { ConfigModule, registerAs } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';
import { jwtConfigKey, AppJwtConfig } from 'src/config/jwt.config';
import { TestingModuleFactory } from './testingModuleFactory.class';

export function useJwtMockFixture(moduleRef: TestingModuleFactory) {
  const jwtModule = new JwtMockModule();

  beforeEach(() => jwtModule.init(moduleRef.instance));

  return jwtModule;
}

export class JwtMockModule {
  static secret = 'test';
  private jwtService: JwtService;

  createModules() {
    return [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          registerAs(
            jwtConfigKey,
            (): AppJwtConfig => ({ secret: JwtMockModule.secret }),
          ),
        ],
      }),
      JwtModule.register({
        global: true,
        signOptions: { expiresIn: '1h' },
      }),
    ];
  }

  init(testingModule: TestingModule) {
    this.jwtService = testingModule.get(JwtService);
  }

  createAuthHeader(userId: number): [string, string] {
    return [
      'Authorization',
      `Bearer ${this.jwtService.sign(
        { sub: userId },
        { secret: JwtMockModule.secret },
      )}`,
    ];
  }
}
