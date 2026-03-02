/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async hashData(hashData: string) {
    const saltRounds = 10;
    return bcrypt.hash(hashData, saltRounds);
  }

  async compareHash(data: string, hash: string) {
    return await bcrypt.compare(data, hash);
  }

  async getTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '900s',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '86400s',
    });

    return { accessToken, refreshToken };
  }

  async validateUser(email: string, password: string): Promise<User> {
    // bcrypt.compare(password, user.passwordHash)
    const user = await this.usersService.findByEmail(email);
    if (user && (await this.compareHash(password, user.passwordHash))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async register(email: string, name: string, password: string) {
    try {
      const existing = await this.usersService.findByEmail(email);
      if (existing) throw new BadRequestException('Email already in use');

      const passwordHash = await this.hashData(password);
      const user = await this.usersService.createUser({
        email,
        name,
        passwordHash,
      });
      const tokens = await this.getTokens(user);
      const hash = await this.hashData(tokens.refreshToken);
      await this.usersService.updateRefreshToken(user.id, hash);
      return { name: user.name, tokens };
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async login(user: User) {
    try {
      const tokens = await this.getTokens(user);
      return tokens;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);

    if (!user || !user.refreshTokenHashed) {
      throw new UnauthorizedException('Access denied');
    }

    const isValid = await this.compareHash(
      refreshToken,
      user.refreshTokenHashed,
    );

    if (!isValid) throw new UnauthorizedException('Invalid refresh token');
    return await this.getTokens(user);
  }
}
