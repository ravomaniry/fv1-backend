import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/auth.annotations';

@ApiTags('Sanity check')
@Controller('sanity-check')
export class SanityCheckController {
  @Public()
  @Get('')
  @ApiOperation({ operationId: 'sanityCheck' })
  async sanityCheck() {
    return {};
  }
}
