import { TasksStatus } from 'src/enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Teams } from './teams.entity';
import { User } from './user.entity';
import { Notifications } from './notifications.entity';

@Entity('tasks')
export class Tasks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TasksStatus,
    default: TasksStatus.TODO,
  })
  status: TasksStatus;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ default: false })
  completed: boolean;

  @Column({ nullable: false })
  teamId: string; // Foreign key reference to Teams.id entity

  @ManyToOne(() => Teams, (team) => team.tasks)
  team: Teams;

  @ManyToOne(() => User, (user) => user.assignedTasks, { nullable: true })
  assignee: User;

  @Column()
  createdBy: string;

  @ManyToOne(() => User, (user) => user.createdTasks)
  creator: User;

  @OneToMany(() => Notifications, (notification) => notification.task)
  notifications: Notifications[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
