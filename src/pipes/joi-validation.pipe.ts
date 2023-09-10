import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'joi';
import { ErrorCodesEnum } from '../common/http-errors';

@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(
    private readonly type: 'query' | 'body' | 'params',
    private readonly schema: ObjectSchema,
  ) {}

  transform(value: any, metadata: any) {
    if (metadata.type === this.type) {
      const { error } = this.schema.validate(value);
      if (error) {
        throw new BadRequestException({
          code: ErrorCodesEnum.invalidPayload,
          message: error.message,
        });
      }
    }
    return value;
  }
}
