// entities/teams.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  //   OneToMany,
  //   ManyToOne,
  //   ManyToMany,
  //   JoinTable,
} from 'typeorm';

@Entity('teams')
export class Teams {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column()
  createdBy: string; // Foreign key to Users.id

  //   @ManyToOne(() => Users, (user) => user.createdTeams)
  //   creator: Users;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
