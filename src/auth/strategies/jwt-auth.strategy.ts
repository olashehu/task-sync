import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import * as dotenv from 'dotenv';
import { User } from 'src/entities/user.entity';

dotenv.config();

interface AuthenticatedRequest extends Request {
  cookies: {
    access_token?: string;
    refresh_token?: string;
  };
}

function extractAccessToken(req: AuthenticatedRequest): string | null {
  const token = req?.cookies?.access_token;
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret) {
      throw new Error('JWT_ACCESS_SECRET is missing');
    }

    const options: StrategyOptionsWithRequest = {
      jwtFromRequest: extractAccessToken,
      secretOrKey: secret,
      passReqToCallback: true,
    };

    super(options);
  }

  validate(req: AuthenticatedRequest, payload: Partial<User>) {
    const accessToken = extractAccessToken(req);
    return { ...payload, accessToken };
  }
}
