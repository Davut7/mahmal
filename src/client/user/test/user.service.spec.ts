import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { UserService } from '../user.service';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<UserEntity>;
  const currentUser = {
    id: '1',
    firstName: 'John',
    role: 'admin',
    department: 'technical',
  };
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    userRepository = moduleRef.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  describe('getMe', () => {
    it('should return an exception when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(userService.getMe({ id: '1' } as any)).rejects.toThrow(
        new NotFoundException(`Account not found. Maybe account deleted?`),
      );
    });
  });

  describe('getUserById', () => {
    it('should return an exception when user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      await expect(userService.getUserById('1')).rejects.toThrow(
        new NotFoundException(`User not found!`),
      );
    });
  });

  describe('deleteUser', () => {
    it('should return an exception when the user to delete not found', async () => {
      const spy = jest
        .spyOn(userService, 'getUserById')
        .mockResolvedValue(null);
      await expect(
        userService.deleteUser(currentUser, refreshToken),
      ).rejects.toThrow(new NotFoundException(`User not found!`));
      expect(spy).toHaveBeenCalledWith('1');
    });
  });
});
