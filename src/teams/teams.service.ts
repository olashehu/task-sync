import {
  Injectable,
  //   NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Teams } from 'src/entities/teams.entity';
import { TeamMember } from 'src/entities/teamMember.entity';
import { UserRole } from 'src/enum';
import { User } from 'src/entities/user.entity';
import { InviteMemberDto } from 'src/dto/invite-member.dto';

@Injectable()
export class TeamsService {
  private teamsRepo: Repository<Teams>;
  private teamMembersRepo: Repository<TeamMember>;
  private usersRepo: Repository<User>;
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.teamsRepo = this.entityManager.getRepository(Teams);
    this.teamMembersRepo = this.entityManager.getRepository(TeamMember);
  }

  async createTeamWithUser(
    team: Partial<Teams>,
    userId: string,
  ): Promise<Teams> {
    try {
      const newTeam = this.teamsRepo.create({
        ...team,
        // createdBy: userId,
        creator: { id: userId },
      });
      const savedTeam = await this.teamsRepo.save(newTeam);

      const teamMember = this.teamMembersRepo.create({
        user: { id: userId },
        team: savedTeam,
        role: UserRole.ADMIN,
      });
      await this.teamMembersRepo.save(teamMember);
      return savedTeam;
    } catch (error) {
      console.log(error);
      throw new Error('Could not create team');
    }
  }

  async inviteMember(
    dto: InviteMemberDto,
    userId: string,
  ): Promise<TeamMember> {
    try {
      const { teamId } = dto;

      // Check if the user is already a member of the team
      const existingMember = await this.teamMembersRepo.findOne({
        where: { userId, teamId },
      });
      if (existingMember) {
        throw new ConflictException('User is already a member of the team');
      }

      // Create and save the new team member
      const newMember = this.teamMembersRepo.create({
        user: { id: userId },
        team: { id: teamId },
        role: UserRole.MEMBER,
      });

      console.log(newMember, 'new member');

      return await this.teamMembersRepo.save(newMember);
    } catch (error) {
      console.log(error);
      throw new Error('Could not invite member');
    }
  }

  async renameTeam(
    teamId: string,
    newName: string,
    userId: string,
  ): Promise<Teams> {
    try {
      const team = await this.teamsRepo.findOne({
        where: { id: teamId },
        relations: ['creator'],
      });
      if (!team) throw new Error('Team not found');

      if (!team.creator || team.creator.id !== userId) {
        throw new Error('You are not authorized to rename this team');
      }

      team.name = newName;
      const t = await this.teamsRepo.save(team);
      console.log(t, 'renamed team');
      return { name: t.name } as Teams;
    } catch (error) {
      console.log(error);
      throw new Error('Could not rename team');
    }
  }

  async deleteTeam(teamId: string, userId: string) {
    try {
      const team = await this.teamsRepo.findOne({
        where: { id: teamId },
        relations: ['creator'],
      });
      if (!team) throw new Error('Team not found');

      if (!team.creator || team.creator.id !== userId) {
        throw new Error('You are not authorized to delete this team');
      }

      await this.teamsRepo.delete(teamId);
      return { message: 'Team deleted successfully' };
    } catch (error) {
      console.log(error);
      throw new Error('Could not delete team');
    }
  }
}
