import { Test, TestingModule } from '@nestjs/testing';
import { ScheduledTasksService } from '../scheduledTasks.service';

describe('ScheduledTasksService', () => {
  let service: ScheduledTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScheduledTasksService],
    }).compile();

    service = module.get<ScheduledTasksService>(ScheduledTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
