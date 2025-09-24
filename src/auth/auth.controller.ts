import {
  Controller,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  HttpCode,
  UseGuards,
  Get,
  Request,
  //   Res,
  //   HttpCode,
  //   Req,
  //   Get,
  //   UseGuards,
} from '@nestjs/common';
// import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
// import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
// import { JwtAuthGuard } from './guards/jwt-auth.guards';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(
      dto.email,
      dto.name,
      dto.password,
    );
    return { user };
  }

  @Post('login')
  @HttpCode(200)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.login(dto);
    return user;
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(
    @Request() req: { user: { id: string; email: string; name: string } },
  ) {
    return req.user;
  }

  //   @Post('login')
  //   @HttpCode(200)
  //   @UsePipes(new ValidationPipe({ whitelist: true }))
  //   async login(
  //     @Body() dto: LoginDto,
  //     @Res({ passthrough: true }) res: Response,
  //   ) {
  //     const user = await this.authService.validateUser(dto.email, dto.password);
  //     const {
  //       accessToken,
  //       refreshToken,
  //       user: safeUser,
  //     } = await this.authService.login(user);

  // set refresh token in httpOnly cookie
  // res.cookie('refresh_token', refreshToken, {
  //   httpOnly: true,
  //   domain: process.env.COOKIE_DOMAIN || 'localhost',
  //   path: '/auth/refresh',
  //   maxAge: (() => {
  //     const v = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  // convert '7d' or '900s' to ms — simple heuristic:
  //         if (v.endsWith('d')) {
  //           const days = parseInt(v.slice(0, -1), 10);
  //           return days * 24 * 60 * 60 * 1000;
  //         }
  //         if (v.endsWith('s')) {
  //           const s = parseInt(v.slice(0, -1), 10);
  //           return s * 1000;
  //         }
  //         return 7 * 24 * 60 * 60 * 1000;
  //       })(),
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //     });

  //     return {
  //       accessToken,
  //       user: safeUser,
  //     };
  //   }

  //   @Post('refresh')
  //   @HttpCode(200)
  //   async refresh(
  //     @Req() req: Request,
  //     @Res({ passthrough: true }) res: Response,
  //   ) {
  //     const refreshToken = req.cookies?.refresh_token;
  //     if (!refreshToken) {
  //       return { ok: false, message: 'No refresh token' };
  //     }

  // decode the refresh token to get user id
  // const decoded = await (async () => {
  //   try {
  //     return await this.authService['jwtService'].verifyAsync(refreshToken, {
  //       secret: process.env.JWT_REFRESH_SECRET,
  //     });
  //   } catch (e) {
  //     return null;
  //   }
  // })();

  // if (!decoded || !decoded.sub) {
  //   return { ok: false, message: 'Invalid token' };
  // }

  // const tokens = await this.authService.refreshTokens(
  //   decoded.sub,
  //   refreshToken,
  // );

  // rotate cookie
  //     res.cookie('refresh_token', tokens.refreshToken, {
  //       httpOnly: true,
  //       domain: process.env.COOKIE_DOMAIN || 'localhost',
  //       path: '/auth/refresh',
  //       maxAge: (() => {
  //         const v = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  //         if (v.endsWith('d')) {
  //           const days = parseInt(v.slice(0, -1), 10);
  //           return days * 24 * 60 * 60 * 1000;
  //         }
  //         if (v.endsWith('s')) {
  //           const s = parseInt(v.slice(0, -1), 10);
  //           return s * 1000;
  //         }
  //         return 7 * 24 * 60 * 60 * 1000;
  //       })(),
  //       secure: process.env.NODE_ENV === 'production',
  //       sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  //     });

  //     return {
  //       accessToken: tokens.accessToken,
  //     };
  //   }

  //   @Post('logout')
  //   @UseGuards(JwtAuthGuard)
  //   async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //     const user = req.user;
  //     await this.authService.logout(user.id);
  //     res.clearCookie('refresh_token', {
  //       domain: process.env.COOKIE_DOMAIN || 'localhost',
  //       path: '/auth/refresh',
  //     });
  //     return { ok: true };
  //   }

  // simple protected test route
  //   @Get('me')
  //   @UseGuards(JwtAuthGuard)
  //   me(@Req() req: Request) {
  //     const user = req.user;
  //     return { user };
  //   }
}
