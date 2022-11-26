import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, registerDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: registerDto) {
    return await this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: loginDto) {
    return await this.authService.login(dto);
  }
}
