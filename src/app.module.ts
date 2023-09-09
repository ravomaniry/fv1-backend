import { Module } from '@nestjs/common';
import { SanityCheckModule } from './modules/sanity-check/sanity-check.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [SanityCheckModule, UserModule],
})
export class AppModule {}
