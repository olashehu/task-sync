/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  //   ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  private async hashData(password: string) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  private async assignToken(user: User) {
    const payload = {
      sub: user.id,
      name: user.name,
      email: user.email,
    };
    return {
      name: user.name,
      acces_token: await this.jwtService.signAsync(payload),
    };
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
      const { passwordHash: _, ...rest } = user;
      const tokenPayload = await this.assignToken(rest as User);
      return tokenPayload;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Registration failed');
    }
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(dto: LoginDto) {
    const user = await this.validateUser(dto.email, dto.password);
    const { passwordHash: _, ...rest } = user;
    const tokenPayload = await this.assignToken(rest as User);
    return tokenPayload;
  }

  //   async getTokens(userId: string, email: string) {
  //     const [accessToken, refreshToken] = await Promise.all([
  //       this.jwtService.signAsync(
  //         { sub: userId, email },
  //         {
  //           secret: process.env.JWT_ACCESS_SECRET,
  //           expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '900s',
  //         },
  //       ),
  //       this.jwtService.signAsync(
  //         { sub: userId, email },
  //         {
  //           secret: process.env.JWT_REFRESH_SECRET,
  //           expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  //         },
  //       ),
  //     ]);

  //     return {
  //       accessToken,
  //       refreshToken,
  //     };
  //   }

  //   async login(user: User) {
  //     const tokens = await this.getTokens(user.id, user.email);
  //     const refreshTokenHash = await this.hashData(tokens.refreshToken);
  //     await this.usersService.setCurrentRefreshTokenHash(
  //       user.id,
  //       refreshTokenHash,
  //     );

  //     return {
  //       accessToken: tokens.accessToken,
  //       refreshToken: tokens.refreshToken,
  //       user: this.usersService.getSafeUser(user),
  //     };
  //   }

  //   async refreshTokens(userId: string, refreshToken: string) {
  //     const user = await this.usersService.findById(userId);
  //     if (!user || !user.currentHashedRefreshToken)
  //       throw new UnauthorizedException('Access Denied');

  //     const refreshTokenMatches = await bcrypt.compare(
  //       refreshToken,
  //       user.currentHashedRefreshToken,
  //     );

  //     if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

  //     const tokens = await this.getTokens(user.id, user.email);
  //     const newRefreshHash = await this.hashData(tokens.refreshToken);
  //     await this.usersService.setCurrentRefreshTokenHash(user.id, newRefreshHash);

  //     return {
  //       accessToken: tokens.accessToken,
  //       refreshToken: tokens.refreshToken,
  //     };
  //   }

  //   async logout(userId: string) {
  //     await this.usersService.removeRefreshToken(userId);
  //   }
}
