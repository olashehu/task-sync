import { Controller, Body } from '@nestjs/common';
import { TeamMemberService } from './teamMember.services';

@Controller('team-members')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}
}
