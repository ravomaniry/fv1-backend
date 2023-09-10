import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.dto';
import { RegisterRequestDto } from './dtos/register.dto';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @HttpCode(200)
  @Post('/login')
  async login(@Body() dto: LoginRequestDto) {
    return this.service.login(dto);
  }

  @Post('/register')
  async register(@Body() dto: RegisterRequestDto) {
    return this.service.register(dto);
  }
}
