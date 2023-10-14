import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import * as Joi from 'joi';
import { LoginRequestDto } from './dtos/login.dto';
import { RegisterRequestDto } from './dtos/register.dto';
import { AuthService } from './services/auth.service';
import { RefreshTokenRequestDto } from './dtos/refresh-token.dto';
import { GetUserId, Public } from './auth.annotations';
import { JoiValidationPipe } from '../../pipes/joi-validation.pipe';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(200)
  @UsePipes(
    new JoiValidationPipe(
      'body',
      Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
      }).required(),
    ),
  )
  async login(@Body() dto: LoginRequestDto) {
    return this.service.login(dto);
  }

  @Post('register')
  @Public()
  @UsePipes(
    new JoiValidationPipe(
      'body',
      Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
      }).required(),
    ),
  )
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
  @UsePipes(
    new JoiValidationPipe(
      'body',
      Joi.object({
        token: Joi.string().required(),
      }),
    ),
  )
  async refreshToken(@Body() body: RefreshTokenRequestDto) {
    return this.service.refreshAccessToken(body.token);
  }

  @Post('logout')
  async logout(@GetUserId() userId: number) {
    await this.service.logOut(userId);
    return {};
  }
}
