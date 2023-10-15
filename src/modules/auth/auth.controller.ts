import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LoginRequestDto } from './dtos/login.dto';
import { RegisterRequestDto } from './dtos/register.dto';
import { AuthService } from './services/auth.service';
import { RefreshTokenRequestDto } from './dtos/refresh-token.dto';
import { GetUserId, Public } from './auth.annotations';
import { ControllerBase } from 'src/common/controller.base';

@ApiTags('Auth')
@Controller('auth')
export class AuthController extends ControllerBase {
  constructor(private readonly service: AuthService) {
    super();
  }

  @Post('login')
  @Public()
  @HttpCode(200)
  async login(@Body() dto: LoginRequestDto) {
    return this.service.login(dto);
  }

  @Post('register')
  @Public()
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
