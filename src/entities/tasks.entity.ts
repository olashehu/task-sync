import { TasksStatus } from 'src/enum';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  teamId: string;

  @Column({ nullable: false })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
