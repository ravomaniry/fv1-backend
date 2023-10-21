import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginRequestDto, LoginResponseDto } from './dtos/login.dto';
import { RegisterRequestDto } from './dtos/register.dto';
import { AuthService } from './services/auth.service';
import { RefreshTokenRequestDto } from './dtos/refresh-token.dto';
import { GetUserId, Public } from './auth.annotations';
import { ControllerBase } from 'src/common/controller.base';
import { UserTokens } from './dtos/user-tokens.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController extends ControllerBase {
  constructor(private readonly service: AuthService) {
    super();
  }

  @Post('login')
  @Public()
  @HttpCode(200)
  @ApiResponse({ type: LoginResponseDto })
  async login(@Body() dto: LoginRequestDto) {
    return this.service.login(dto);
  }

  @Post('register')
  @Public()
  @ApiResponse({ type: LoginResponseDto })
  async register(@Body() dto: RegisterRequestDto) {
    return this.service.register(dto);
  }

  @Public()
  @Post('register-guest')
  @ApiResponse({ type: LoginResponseDto })
  async registerGuest() {
    return this.service.registerGuest();
  }

  @Public()
  @Post('refresh-token')
  @ApiResponse({ type: UserTokens })
  async refreshToken(@Body() body: RefreshTokenRequestDto) {
    return this.service.refreshAccessToken(body.token);
  }

  @Post('logout')
  async logout(@GetUserId() userId: number) {
    await this.service.logOut(userId);
    return {};
  }
}
