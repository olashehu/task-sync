import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import * as dotenv from 'dotenv';
import { User } from './entities/user.entity';
import { TeamsModule } from './teams/teams.module';
import { Teams } from './entities/teams.entity';
import { TeamMemberModule } from './teamMember/teamMember.module';
import { TeamMember } from './entities/teamMember.entity';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Teams, TeamMember],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    TeamsModule,
    TeamMemberModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
