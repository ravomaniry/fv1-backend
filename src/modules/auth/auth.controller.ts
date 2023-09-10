import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.dto';
import { RegisterRequestDto } from './dtos/register.dto';
import { AuthService } from './services/auth.service';
import { RefreshTokenRequestDto } from './dtos/refresh-token.dto';
import { GetUserId, Public } from './auth.annotations';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: LoginRequestDto) {
    return this.service.login(dto);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterRequestDto) {
    return this.service.register(dto);
  }

  @Public()
  @Post('register-guest')
  async registerGuest() {
    return this.service.registerGuest();
  }

  @Public()
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenRequestDto) {
    return this.service.refreshAccessToken(body.token);
  }

  @Post('logout')
  async logout(@GetUserId() userId: number) {
    await this.service.logOut(userId);
    return {};
  }
}
