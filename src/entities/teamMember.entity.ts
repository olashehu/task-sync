import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { UserRole } from '../enum';
import { Teams } from './teams.entity';
import { User } from './user.entity';

@Entity('team_members')
@Unique(['userId', 'teamId'])
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  userId: string;

  @ManyToOne(() => User, (user) => user.teamMemberships)
  user: User;

  @Column({ nullable: false })
  teamId: string;

  @ManyToOne(() => Teams, (team) => team.members)
  team: Teams;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @CreateDateColumn({ name: 'joinedAt' })
  joinedAt: Date;
}
