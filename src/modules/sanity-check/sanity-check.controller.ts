import { Controller, Get } from '@nestjs/common';

@Controller('sanity-check')
export class SanityCheckController {
  @Get('')
  async sanityCheck() {
    return {};
  }
}
