import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';

export const isPublicKey = 'isPublic';
export const Public = () => SetMetadata(isPublicKey, true);

export const GetUserId = createParamDecorator(
  async (_: string, ctx: ExecutionContext) => {
    return ctx.switchToHttp().getRequest().user?.sub;
  },
);
