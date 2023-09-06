import { Module } from '@nestjs/common';
import { SanityCheckController } from './sanity-check.controller';

@Module({
  controllers: [SanityCheckController],
})
export class SanityCheckModule {}
