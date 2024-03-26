import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserController } from '../user.controller';
import { UserService } from '../user.service';
import { UserEntity } from '../entities/adminUsers.entity';

describe('UserController', () => {
  let userController: UserController;
  let userService: UserService;

  beforeEach(async () => {
    // mock UserService instance
    userService = new UserService(null);

    userController = new UserController(userService);
  });

  it('should return a user entity when getMe called', async () => {
    const result = new UserEntity();
    jest
      .spyOn(userService, 'getMe')
      .mockImplementation(() => Promise.resolve(result));

    expect(await userController.getMe({ id: '1' } as any)).toBe(result);
  });

  it('should throw NotFoundException when getMe called but user not found', async () => {
    jest
      .spyOn(userService, 'getMe')
      .mockImplementation(() => Promise.reject(new NotFoundException()));

    await expect(userController.getMe({ id: '1' } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return a user entity array when getUsers called', async () => {
    const result = [new UserEntity()];
    jest
      .spyOn(userService, 'getUsers')
      .mockImplementation(() => Promise.resolve(result));

    expect(await userController.getUsers()).toBe(result);
  });

  it('should return a user entity when getUserById called', async () => {
    const result = new UserEntity();
    jest
      .spyOn(userService, 'getUserById')
      .mockImplementation(() => Promise.resolve(result));

    expect(await userController.getUserById('1')).toBe(result);
  });

  it('should return an updated user entity when updateUser called', async () => {
    const result = new UserEntity();
    jest
      .spyOn(userService, 'updateUser')
      .mockImplementation(() => Promise.resolve(result));

    expect(await userController.updateUser('1', {} as any)).toBe(result);
  });

  it('should return a deleted user entity when deleteUser called', async () => {
    const result = new UserEntity();
    jest
      .spyOn(userService, 'deleteUser')
      .mockImplementation(() => Promise.resolve(result));

    expect(await userController.deleteUser('1')).toBe(result);
  });
});
