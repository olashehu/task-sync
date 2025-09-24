import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from 'src/entities/teamMember.entity';
import { TeamMemberController } from './teamMember.controller';
import { TeamMemberService } from './teamMember.services';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember])],
  controllers: [TeamMemberController],
  providers: [TeamMemberService],
})
export class TeamMemberModule {}
