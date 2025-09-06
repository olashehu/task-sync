import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  getAllUsers() {
    return 'This will return all users';
  }
}
