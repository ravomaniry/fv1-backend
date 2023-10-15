import { ApiBearerAuth } from '@nestjs/swagger';
import {
  BadRequestException,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '../modules/auth/auth.guard';
import { ErrorCodesEnum } from './http-errors';

@ApiBearerAuth()
@UseGuards(AuthGuard)
@UsePipes(
  new ValidationPipe({
    transform: true,
    exceptionFactory: (errors) =>
      new BadRequestException({
        code: ErrorCodesEnum.invalidPayload,
        message: errors,
      }),
  }),
)
export class ControllerBase {}
