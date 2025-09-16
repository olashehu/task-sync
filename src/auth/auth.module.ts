import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';

import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
    }),
    UsersModule,
  ],
  providers: [AuthService /*, JwtStrategy*/],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
