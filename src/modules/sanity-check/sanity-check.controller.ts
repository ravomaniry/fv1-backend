import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/auth.annotations';

@ApiTags('Sanity check')
@Controller('sanity-check')
export class SanityCheckController {
  @Public()
  @Get('')
  async sanityCheck() {
    return {};
  }
}
