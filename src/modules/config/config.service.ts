import { Injectable } from '@nestjs/common';
import * as process from 'process';
import * as assert from 'assert';

@Injectable()
export class ConfigService {
  readonly jwtSecret = process.env.JWT_SECRET;
  constructor() {
    assert(!!this.jwtSecret);
  }
}
