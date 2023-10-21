import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { isPublicKey } from './auth.annotations';
import { AppJwtConfig, jwtConfigKey } from 'src/config/jwt.config';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly jwtSecret: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const config = this.configService.get<AppJwtConfig>(jwtConfigKey);
    this.jwtSecret = config!.secret;
  }

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
        secret: this.jwtSecret,
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
