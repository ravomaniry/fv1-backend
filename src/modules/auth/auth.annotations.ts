import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  SetMetadata,
} from '@nestjs/common';

export const isPublicKey = 'isPublic';
export const Public = () => SetMetadata(isPublicKey, true);

export const GetUserId = createParamDecorator(
  async (_: string, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user;
    if (!user) {
      throw new InternalServerErrorException('Req.user is not defined');
    }
    return user.sub;
  },
);
