import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { AuthService } from '../auth.service';
import { NotFoundException } from '@nestjs/common';
import { TokenService } from '../../token/token.service';
import { UserService } from '../../user/user.service';
import { TokenEntity } from '../../token/entities/token.entity';
import { CityEnum } from '../../../helpers/constants/user/enums/cityEnum.enum';
import { UserLoginDto } from '../dto/userLogin.dto';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: Repository<UserEntity>;

  const mockUser: UserEntity = {
    id: '1',
    phoneNumber: '+99361853066',
    banReason: null,
    bio: 'Work in computer club',
    birthDate: new Date('10.10.2003'),
    city: CityEnum.ASHGABAT,
    firstName: 'David',
  };

  let user: UserEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        TokenService,
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TokenEntity),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  describe('findUserByPhoneNumber', () => {
    it('should return a user if found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.findUserByPhoneNumber(mockUser.phoneNumber);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      await expect(
        service.findUserByPhoneNumber('+99361616161'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('assignVerificationCode', () => {
    it('should assign verification code successfully', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
      const result = await service.assignVerificationCode(mockUser.phoneNumber);
      expect(result).toEqual(mockUser);
    });
  });

  describe('sentVerificationCode', () => {
    it('should send verification code successfully', async () => {
      const dto: UserLoginDto = {
        phoneNumber: mockUser.phoneNumber,
      };

      const result = await service.sentVerificationCode(dto);
      expect(result).toEqual({
        message: 'Verification code sent successfully!',
      });
    });

    it('should throw NotFoundException if user not found for sending verification code', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const dto = { phoneNumber: 'nonexistent' };
      await expect(service.sentVerificationCode(dto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
