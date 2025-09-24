import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { TeamMember } from './teamMember.entity';

@Entity('teams')
export class Teams {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // @Column()
  // createdBy: string;

  @ManyToOne(() => User, (user) => user.createdTeam, { eager: true })
  creator: User;

  @OneToMany(() => TeamMember, (teamMember) => teamMember.team)
  members: TeamMember[]; // Via junction

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
