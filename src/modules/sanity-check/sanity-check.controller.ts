import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/auth.annotations';

@Controller('sanity-check')
export class SanityCheckController {
  @Public()
  @Get('')
  async sanityCheck() {
    return {};
  }
}
