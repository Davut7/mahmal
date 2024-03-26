import { Test, TestingModule } from '@nestjs/testing';
import { SavedPostsController } from '../savedPosts.controller';
import { SavedPostsService } from '../savedPosts.service';

describe('SavedPostsController', () => {
  let controller: SavedPostsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavedPostsController],
      providers: [SavedPostsService],
    }).compile();

    controller = module.get<SavedPostsController>(SavedPostsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
