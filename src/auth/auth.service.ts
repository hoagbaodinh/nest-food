import { comparePasswordHelper } from '@/helpers/util';
import { UsersService } from '@/modules/users/users.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  CreateAuthDto,
  CodeAuthDto,
  ChangePassDto,
} from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;

    const isValidPassword = await comparePasswordHelper(pass, user.password);

    if (!isValidPassword) return null;
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user._id };

    return {
      user: {
        email: user.email,
        _id: user._id,
        name: user.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: CreateAuthDto) {
    return this.usersService.handleRegister(registerDto);
  }

  async handleActive(codeAuthDto: CodeAuthDto) {
    return this.usersService.handleActive(codeAuthDto);
  }

  async handleReactive(email: string) {
    return this.usersService.handleReactive(email);
  }
  async handleRetryPassword(email: string) {
    return this.usersService.handleRetryPassword(email);
  }
  async handleChangePassword(changePassDto: ChangePassDto) {
    return this.usersService.handleChangePassword(changePassDto);
  }
}
