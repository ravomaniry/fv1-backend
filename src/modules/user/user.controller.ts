import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { LoginRequestDto } from './dtos/login.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly service: UserService) {}

  @HttpCode(200)
  @Post('/login')
  async login(@Body() body: LoginRequestDto) {
    return this.service.getByCredentials(body);
  }
}
