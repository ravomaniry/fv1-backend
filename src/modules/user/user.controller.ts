import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.dto';
import { UserService } from './user.service';
import { RegisterRequestDto } from './dtos/register.dto';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

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
