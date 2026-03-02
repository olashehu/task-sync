import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from 'src/dto/create-task.dto';
import { UpdateTaskDto } from 'src/dto/update-task.dto';
import { Tasks } from 'src/entities/tasks.entity';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(
    @Body() createTaskDto: CreateTaskDto,
  ): Promise<Tasks | undefined> {
    return await this.taskService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taskService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }

  @Delete(':taskId')
  async removeTask(
    @Param('taskId') taskId: string,
    @Query('teamId') teamId: string,
  ): Promise<{ message: string }> {
    return await this.taskService.remove(taskId, teamId);
  }
}
