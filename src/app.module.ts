import { Module } from '@nestjs/common';
import { SanityCheckModule } from './sanity-check/sanity-check.module';

@Module({
  imports: [SanityCheckModule],
})
export class AppModule {}
