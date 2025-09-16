import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createUser(user: Partial<User>): Promise<User> {
    const u = this.usersRepository.create(user);
    return this.usersRepository.save(u);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  //   async setCurrentRefreshTokenHash(userId: string, hash: string | null) {
  //     await this.usersRepository.update(userId, {
  //       currentHashedRefreshToken: hash,
  //     });
  //   }

  //   async removeRefreshToken(userId: string) {
  //     await this.setCurrentRefreshTokenHash(userId, null);
  //   }
}
