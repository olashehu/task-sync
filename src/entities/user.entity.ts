import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { UserRole } from '../enum';
import { Teams } from './teams.entity';
import { TeamMember } from './teamMember.entity';
import { Tasks } from './tasks.entity';
import { Notifications } from './notifications.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshTokenHashed?: string | null;

  // References/Relationships
  @OneToMany(() => Teams, (team) => team.creator)
  createdTeam: Teams[];

  @OneToMany(() => TeamMember, (teamMember) => teamMember.user)
  teamMemberships: TeamMember[];

  @OneToMany(() => Tasks, (task) => task.assignee)
  assignedTasks: Tasks[];

  @OneToMany(() => Tasks, (task) => task.creator)
  createdTasks: Tasks[];

  @OneToMany(() => Notifications, (notification) => notification.user)
  notifications: Notifications[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
