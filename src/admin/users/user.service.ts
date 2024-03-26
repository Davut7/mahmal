import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/userUpdate.dto';
import { AdminEntity } from './entities/adminUsers.entity';
import { AdminTokenDto } from '../token/dto/token.dto';
import { CreateUserDto } from './dto/createUser.dto';
import { hash } from 'bcryptjs';

@Injectable()
export class AdminUserService {
  constructor(
    @InjectRepository(AdminEntity)
    private userRepository: Repository<AdminEntity>,
  ) {}

  async createUser(dto: CreateUserDto) {
    const candidate = await this.userRepository.findOne({
      where: { firstName: dto.firstName },
    });
    if (candidate)
      throw new ConflictException(
        `User with this firstName ${dto.firstName} already exists`,
      );
    const hashPassword = await hash(dto.password, 10);
    dto.password = hashPassword;
    const user = this.userRepository.create(dto);
    await this.userRepository.save(user);
    return {
      message: 'Admin created successfully',
      user: user,
    };
  }

  async getMe(currentUser: AdminTokenDto) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.token', 'token')
      .where('user.id = :userId', { userId: currentUser.id })
      .getOne();
    if (!user) throw new BadRequestException('Current user not found!');
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User not found!`);
    }

    return user;
  }

  async getUsers() {
    const users = await this.userRepository.findAndCount();
    return users;
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.getUserById(userId);

    Object.assign(user, dto);

    await this.userRepository.save(user);

    return {
      message: 'User updated successfully',
      user,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.getUserById(userId);

    await this.userRepository.delete(user.id);

    return {
      message: 'User deleted successfully',
    };
  }
}
