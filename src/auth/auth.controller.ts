import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { Public, ResponseMessage } from '@/decorator/customize';
import {
  ChangePassDto,
  CodeAuthDto,
  CreateAuthDto,
} from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private mailerService: MailerService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('login')
  @ResponseMessage('Fetch login')
  create(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }
  @Post('check-code')
  @Public()
  checkCode(@Body() codeDto: CodeAuthDto) {
    return this.authService.handleActive(codeDto);
  }
  @Post('reactive')
  @Public()
  reactive(@Body('email') email: string) {
    return this.authService.handleReactive(email);
  }
  @Post('retry-password')
  @Public()
  retryPassword(@Body('email') email: string) {
    return this.authService.handleRetryPassword(email);
  }
  @Post('change-password')
  @Public()
  changePassword(@Body() changPassDto: ChangePassDto) {
    return this.authService.handleChangePassword(changPassDto);
  }

  @Get('mail')
  @Public()
  testMail() {
    this.mailerService.sendMail({
      to: 'hoagbao.dinh4@gmail.com',
      subject: 'Testing Nest Mail',
      text: 'Welcome',
      template: 'register',
      context: {
        name: 'Pin',
        activationCode: 123123123,
      },
    });
    return 'ok';
  }
}
