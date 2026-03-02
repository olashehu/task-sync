import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Delete,
  Get,
  Patch,
} from '@nestjs/common';
import type { Request } from 'express';
import { TeamsService } from './teams.service';
import { Teams } from 'src/entities/teams.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { InviteByIdentifierDto } from 'src/dto/invite-member.dto';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createTeam(
    @Body() body: Partial<Teams>,
    @Req() req: Request & { user: { sub: string } },
  ): Promise<Teams> {
    const userId = req.user.sub;
    return await this.teamsService.createTeamWithUser(body, userId);
  }
  @UseGuards(JwtAuthGuard)
  @Post(':teamId/invite')
  async invite(
    @Body() dto: InviteByIdentifierDto,
    @Param('teamId') teamId: string,
  ) {
    return await this.teamsService.inviteByIdentifier(dto.identifier, teamId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':inviteId')
  async acceptInvite(
    @Req() req: Request & { user: { sub: string } },
    @Param('inviteId') inviteId: string,
  ) {
    const userId = req.user.sub;
    return await this.teamsService.acceptInvite(inviteId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':teamId/admin/:userId')
  async assignAdmin(
    @Req() req: Request & { user: { sub: string } },
    @Param('userId') userId: string,
    @Param('teamId') teamId: string,
  ) {
    const requesterId = req.user.sub;
    return await this.teamsService.assignAdmin(teamId, userId, requesterId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':teamId')
  async renameTeam(
    @Req() req: Request & { user: { sub: string } },
    @Body('name') name: string,
    @Param('teamId') teamId: string,
  ): Promise<Teams> {
    const userId = req.user.sub;
    return await this.teamsService.renameTeam(teamId, name, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':teamId')
  async getTeamMembers(
    @Param('teamId') teamId: string,
    @Req() req: Request & { user: { sub: string } },
  ) {
    const userId = req.user.sub;
    return await this.teamsService.getTeamWithUsers(teamId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':teamId/member/:userId')
  async removeMember(
    @Req() req: Request & { user: { sub: string } },
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
  ) {
    const requesterId = req.user.sub;
    return await this.teamsService.removeMember(teamId, userId, requesterId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':teamId')
  async deleteTeam(
    @Req() req: Request & { user: { sub: string } },
    @Param('teamId') teamId: string,
  ) {
    const userId = req.user.sub;
    return await this.teamsService.deleteTeam(teamId, userId);
  }
}
