import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../config/config.service';
import { isPublicKey } from './auth.annotations';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(isPublicKey, [
      context.getHandler(),
      context.getClass,
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token is not in the header.');
    }
    try {
      request['user'] = await this.jwtService.verifyAsync(token, {
        secret: this.configService.jwtSecret,
      });
      return true;
    } catch (e) {
      throw new UnauthorizedException(e);
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const headers = request.headers as unknown as Record<string, string>;
    const [type, token] = headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
