/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { Request } from 'express';
// import { UsersService } from 'src/users/users.service';
import { User } from 'src/entities/user.entity';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.refresh_token,
      secretOrKey: process.env.JWT_REFRESH_SECRET as string,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: Partial<User>) {
    const refreshToken = req.cookies['refresh_token'];
    return { ...payload, refreshToken };
  }
}
