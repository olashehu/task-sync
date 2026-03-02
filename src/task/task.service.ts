import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Tasks } from 'src/entities/tasks.entity';
// import { Notifications } from 'src/entities/notifications.entity';
import { Teams } from 'src/entities/teams.entity';
import { User } from 'src/entities/user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class TaskService {
  private tasks: Repository<Tasks>;
  private teams: Repository<Teams>;
  private users: Repository<User>;
  // private notifications: Repository<Notifications>;
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    this.tasks = this.entityManager.getRepository(Tasks);
    this.teams = this.entityManager.getRepository(Teams);
    this.users = this.entityManager.getRepository(User);
    // this.notifications = this.entityManager.getRepository(Notifications);
  }
  async create(createTaskDto: CreateTaskDto) {
    try {
      const { userId, teamId, title, description } = createTaskDto;
      //check if team exist
      const team = await this.teams.findOne({
        where: { id: teamId },
        relations: ['members'],
      });

      if (!team || team.id !== teamId) {
        throw new NotFoundException('Team not found');
      }

      const user = team.members.find((member) => member.userId === userId);
      if (!user) {
        throw new NotFoundException(
          'User is not a member of the team, cannot create task',
        );
      }
      console.log(user, 'user');
      //create task
      const newTask = this.tasks.create({
        title,
        description,
        teamId,
        team,
        createdBy: userId,
        creator: user.user,
      });
      const savedTask = await this.tasks.save(newTask);
      //notify team members
      return savedTask;
    } catch (error) {
      console.error(error);
    }
  }

  findAll() {
    return `This action returns all task`;
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    console.log(updateTaskDto);
    return `This action updates a #${id} task`;
  }

  async remove(taskId: string, teamId: string): Promise<{ message: string }> {
    try {
      console.log(taskId, teamId, 'ids');
      const team = await this.teams.findOne({ where: { id: teamId } });
      if (!team) {
        throw new NotFoundException('Team not found');
      }
      console.log(team, 'team');

      const task = await this.tasks.findOne({ where: { id: taskId, teamId } });
      if (!task) {
        throw new NotFoundException('Task not found in the specified team');
      }
      console.log(task, 'task');

      // await this.tasks.remove(taskId);
      return Promise.resolve({
        message: `This action removes a #${taskId} task`,
      });
    } catch (error) {
      console.error(error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error('Server Error: Unable to remove task');
    }
  }
}
