import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { Teams } from 'src/entities/teams.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { InviteMemberDto } from 'src/dto/invite-member.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async createTeam(
    @Body() body: Partial<Teams>,
    @Request() req: { user: { sub: string } },
  ): Promise<Teams> {
    const userId = req.user.sub;
    return await this.teamsService.createTeamWithUser(body, userId);
  }

  @UseGuards(AuthGuard)
  @Put(':id')
  async renameTeam(
    @Request() req: { user: { sub: string } },
    @Body('name') name: string,
    @Param('teamId') teamId: string,
  ): Promise<Teams> {
    const userId = req.user.sub;
    return await this.teamsService.renameTeam(teamId, name, userId);
  }

  @UseGuards(AuthGuard)
  @Delete(':teamId')
  async deleteTeam(
    @Request() req: { user: { sub: string } },
    @Param('teamId') teamId: string,
  ) {
    const userId = req.user.sub;
    return await this.teamsService.deleteTeam(teamId, userId);
  }

  @UseGuards(AuthGuard)
  @Post('invite')
  async invite(
    @Body() dto: InviteMemberDto,
    @Request() req: { user: { sub: string } },
  ) {
    const userId = req.user.sub;
    return await this.teamsService.inviteMember(dto, userId);
  }
}
