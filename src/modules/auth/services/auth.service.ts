import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserEntity } from '../../user/entities/user.entity';
import { LoginRequestDto, LoginResponseDto } from '../dtos/login.dto';
import { UserService } from '../../user/user.service';
import { PasswordService } from './password.service';
import { ErrorCodesEnum } from '../../../common/http-errors';
import { RegisterRequestDto } from '../dtos/register.dto';
import { TokenService } from './token.service';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
  ) {}

  async login(body: LoginRequestDto): Promise<LoginResponseDto> {
    const user = await this.userService.findByUsername(body.username);
    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCodesEnum.invalidCredentials,
      });
    }
    const hashedPwd = this.passwordService.hashPassword(
      user.username,
      body.password,
    );
    if (user.hashedPassword !== hashedPwd) {
      throw new UnauthorizedException({
        code: ErrorCodesEnum.invalidCredentials,
      });
    }
    return this.buildLoginResponse(user);
  }

  async register(body: RegisterRequestDto): Promise<LoginResponseDto> {
    if (this.passwordService.passwordIsWeak(body.password)) {
      throw new BadRequestException({ code: ErrorCodesEnum.weakPassword });
    }
    const user = await this.userService.insertOrFail(
      this.dataSource.manager.create(UserEntity, {
        username: body.username,
        hashedPassword: this.passwordService.hashPassword(
          body.username,
          body.password,
        ),
      }),
    );
    if (!user) {
      throw new InternalServerErrorException({
        message: 'The newly inserted user was not found in the database',
        code: ErrorCodesEnum.unknownError,
      });
    }
    return this.buildLoginResponse(user);
  }

  async buildLoginResponse(user: UserEntity): Promise<LoginResponseDto> {
    return {
      user: {
        id: user.id,
        username: user.username,
      },
      tokens: await this.tokenService.generate(user),
    };
  }
}
