import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { NotificationType } from 'src/enum';
import { User } from './user.entity';
import { Tasks } from './tasks.entity';

@Entity('notifications')
export class Notifications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;

  @Column({ nullable: true })
  taskId: string;

  @ManyToOne(() => Tasks, (task) => task.notifications, { nullable: true })
  task: Tasks;

  @Column({ type: 'text', nullable: false })
  message: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
