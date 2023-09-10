import { Module } from '@nestjs/common';
import { SanityCheckModule } from './modules/sanity-check/sanity-check.module';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [SanityCheckModule, UserModule, AuthModule],
})
export class AppModule {}
