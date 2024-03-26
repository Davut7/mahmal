import { Test, TestingModule } from '@nestjs/testing';
import { SubscribesService } from '../followers.service';

describe('SubscribesService', () => {
  let service: SubscribesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubscribesService],
    }).compile();

    service = module.get<SubscribesService>(SubscribesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
