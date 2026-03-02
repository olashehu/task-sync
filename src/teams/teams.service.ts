import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Teams } from 'src/entities/teams.entity';
import { TeamMember } from 'src/entities/teamMember.entity';
import { UserRole } from 'src/enum';
import { User } from 'src/entities/user.entity';
import { TeamInvite } from 'src/entities/teamInvite';
// import { InviteMemberDto } from 'src/dto/invite-member.dto';

@Injectable()
export class TeamsService {
  private teamsRepo: Repository<Teams>;
  private teamMembersRepo: Repository<TeamMember>;
  private usersRepo: Repository<User>;
  private teamInviteRepo: Repository<TeamInvite>;
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.teamsRepo = this.entityManager.getRepository(Teams);
    this.teamMembersRepo = this.entityManager.getRepository(TeamMember);
    this.teamInviteRepo = this.entityManager.getRepository(TeamInvite);
    this.usersRepo = this.entityManager.getRepository(User);
  }

  async createTeamWithUser(
    team: Partial<Teams>,
    userId: string,
  ): Promise<Teams> {
    try {
      // check if team exists
      const existingTeam = await this.teamsRepo.findOne({
        where: { name: team.name },
      });
      if (existingTeam) {
        throw new ConflictException('A team with this name already exists');
      }
      // Create new team and save the reference id
      const newTeam = this.teamsRepo.create({
        ...team,
        creator: { id: userId },
      });
      // Save the new team to db
      const savedTeam = await this.teamsRepo.save(newTeam);

      // Create the team-member with the user and team references and change the role to admin
      const teamMember = this.teamMembersRepo.create({
        user: { id: userId },
        team: savedTeam,
        role: UserRole.ADMIN,
      });
      // Save the created team-member
      await this.teamMembersRepo.save(teamMember);
      // Return the created team object.
      return savedTeam;
    } catch (error) {
      console.log(error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error('Could not create team');
    }
  }

  async inviteByIdentifier(
    identifier: string,
    teamId: string,
  ): Promise<{ message: string }> {
    try {
      // find user by email or name
      const user = await this.usersRepo.findOne({
        where: [{ email: identifier }, { name: identifier }],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // check if an invite already exists
      const existingInvite = await this.teamInviteRepo.findOne({
        where: { user: { id: user.id }, team: { id: teamId }, accepted: false },
      });
      if (existingInvite) {
        throw new ConflictException(
          `An invite to join team: ${existingInvite.team.name} has already been sent to ${user.name}`,
        );
      }
      // create and save the invite
      const invite = this.teamInviteRepo.create({
        user: { id: user.id },
        team: { id: teamId },
      });
      await this.teamInviteRepo.save(invite);

      // Send an actual message/email to the user
      // e.g., await method(user.email, teamId);
      return { message: 'Invitation sent to user. Awaiting acceptance.' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('Server error+');
    }
  }

  async acceptInvite(inviteId: string, userId: string) {
    try {
      const invite = await this.teamInviteRepo.findOne({
        where: { id: inviteId, user: { id: userId }, accepted: false },
        relations: ['team', 'user'],
      });
      if (!invite) {
        throw new NotFoundException('Invite not found or already accepted');
      }

      // Check if the user is already a member of the team
      const existingMember = await this.teamMembersRepo.findOne({
        where: { userId, teamId: invite.team.id },
      });
      if (existingMember) {
        throw new ConflictException('User is already a member of the team');
      }

      // Add user to the team as a member
      const newMember = this.teamMembersRepo.create({
        user: { id: userId },
        team: { id: invite.team.id },
        role: UserRole.MEMBER,
      });
      await this.teamMembersRepo.save(newMember);

      // Mark the invite as accepted
      invite.accepted = true;
      await this.teamInviteRepo.save(invite);

      return {
        message: `Invite accepted and you have been added to the team: ${invite.team.name}`,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('Could not accept invite');
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
        relations: ['members'],
      });
      if (!team) throw new NotFoundException('Team not found');

      const isAdmin = team.members.find((m) => m.userId === userId);
      if (!isAdmin || isAdmin.role !== UserRole.ADMIN) {
        throw new UnauthorizedException(
          'You are not authorized to rename this team',
        );
      }

      team.name = newName;
      const t = await this.teamsRepo.save(team);
      return { name: t.name } as Teams;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new Error('Server error');
    }
  }

  async deleteTeam(
    teamId: string,
    userId: string,
  ): Promise<{ message: string }> {
    try {
      const team = await this.teamsRepo.findOne({
        where: { id: teamId },
        relations: ['creator'],
      });
      if (!team) throw new NotFoundException('Team not found');

      if (!team.creator || team.creator.id !== userId) {
        throw new UnauthorizedException(
          'You are not authorized to delete this team',
        );
      }

      await this.teamsRepo.delete(teamId);
      return { message: 'Team deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        return error;
      }
      throw new Error('Server error');
    }
  }

  async getTeamWithUsers(teamId: string, userId: string) {
    try {
      const team = await this.teamsRepo.findOne({
        where: { id: teamId },
        relations: ['members', 'members.user'],
      });

      if (!team) {
        throw new NotFoundException('Team not found');
      }

      // check if the requesting user is a member of the team
      const isMember = team.members.some((member) => member.userId === userId);
      if (!isMember) {
        throw new ForbiddenException(
          'You are not authorized to view this team',
        );
      }

      return {
        id: team.id,
        name: team.name,
        users: team.members.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role,
          joinedAt: member.joinedAt,
        })),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      console.log(error);
      throw new Error('Could not fetch team with users');
    }
  }

  async removeMember(
    teamId: string,
    userId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
    try {
      //First check if the team exist
      const team = await this.teamsRepo.findOne({
        where: { id: teamId },
        relations: ['members'],
      });
      if (!team) {
        throw new NotFoundException('Team not found');
      }

      //Check if the requester is a member and admin
      const requesterMembership = team.members.find(
        (member) => member.userId === requesterId,
      );
      if (!requesterMembership || requesterMembership.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to remove members from this team',
        );
      }

      // Check if the user to be removed is a member of the team
      const memberToRemove = team.members.find(
        (member) => member.userId === userId,
      );
      if (!memberToRemove) {
        throw new NotFoundException('User is not a member of the team');
      }

      // Prevent removing the last admin
      if (memberToRemove.role === UserRole.ADMIN) {
        const adminCount = team.members.filter(
          (member) => member.role === UserRole.ADMIN,
        ).length;
        if (adminCount <= 1) {
          throw new ConflictException(
            'Cannot remove the last admin from the team.',
          );
        }
      }

      await this.teamMembersRepo.delete(memberToRemove.id);
      return { message: 'Member removed from the team successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new Error('Could not remove member from team');
    }
  }

  async assignAdmin(
    teamId: string,
    userId: string,
    requesterId: string,
  ): Promise<{ message: string }> {
    try {
      // First check if the team exists
      const team = await this.teamsRepo.findOne({
        where: { id: teamId },
        relations: ['members'],
      });
      if (!team) {
        throw new NotFoundException('Team not found');
      }

      // Check if the requester is a member and admin
      const requesterMembership = team.members.find(
        (member) => member.userId === requesterId,
      );
      if (!requesterMembership || requesterMembership.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to assign admin role in this team',
        );
      }

      // Check if the user to be promoted is a member of the team
      const memberToPromote = team.members.find(
        (member) => member.userId === userId,
      );
      if (!memberToPromote) {
        throw new NotFoundException('User is not a member of the team');
      }

      // Update the member's role to ADMIN
      memberToPromote.role = UserRole.ADMIN;
      await this.teamMembersRepo.save(memberToPromote);

      return { message: 'Member promoted to admin successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new Error('Could not assign admin role');
    }
  }
}
