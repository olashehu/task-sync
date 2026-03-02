import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
// import { AuthGuard } from './auth.guard';
import * as dotenv from 'dotenv';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

dotenv.config();

const cookieOpts = {
  httpOnly: true,
  secure: false, // set true on production (https)
  sameSite: 'lax' as const,
  domain: process.env.COOKIE_DOMAIN || undefined,
};

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.register(
      dto.email,
      dto.name,
      dto.password,
    );

    const { name, tokens } = user;

    res.cookie('access_token', tokens.accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { name, message: 'Registration successful' };
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    const tokens = await this.authService.login(user);

    res.cookie('access_token', tokens.accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { name: user.name, message: 'Login successfully' };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: Request & { user: { sub: string; refreshToken: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;
    const tokens = await this.authService.refreshTokens(
      user.sub,
      user.refreshToken,
    );

    res.cookie('access_token', tokens.accessToken, {
      ...cookieOpts,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { message: 'Refreshed' };
  }

  @Post('logout')
  async logout(
    @Res({ passthrough: true }) res: Response,
    @Body('userId') userId?: string,
  ) {
    // clear cookies and remove refresh token server-side
    if (userId) {
      await this.usersService.clearRefreshToken(userId);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }
}
