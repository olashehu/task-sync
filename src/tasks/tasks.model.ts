// entities/tasks.entity.ts
import { TaskPriority, TaskStatus } from 'src/enums';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  //   ManyToOne,
  //   OneToMany,
} from 'typeorm';
// import { Teams } from './teams.entity';
// import { Users } from './users';
// import { Notifications } from './notifications.entity';

@Entity('tasks')
export class Tasks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date;

  @Column()
  teamId: string; // Foreign key to Teams.id

  //   @ManyToOne(() => Teams, (team) => team.tasks)
  //   team: Teams;

  @Column()
  createdBy: string; // Foreign key to Users.id

  //   @ManyToOne(() => Users, (user) => user.createdTasks)
  //   creator: Users;

  @Column({ nullable: true })
  assignedTo?: string; // Foreign key to Users.id (nullable)

  //   @ManyToOne(() => Users, (user) => user.assignedTasks, { nullable: true })
  //   assignee Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  //   @OneToMany(() => Notifications, (notification) => notification.task)
  //   notifications: Notifications[];
}
