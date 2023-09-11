import { ApiBearerAuth } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../modules/auth/auth.guard';

@ApiBearerAuth()
@UseGuards(AuthGuard)
export class ControllerBase {}
