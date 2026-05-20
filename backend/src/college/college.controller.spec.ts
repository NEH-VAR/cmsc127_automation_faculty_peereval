import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollegeController } from './college.controller';
import { CollegeService } from './college.service';
import { College } from './entities/college.entity';
import { User } from '../users/entities/user.entity';

describe('CollegeController', () => {
  let controller: CollegeController;

  beforeEach(async () => {
    const mockRepo = {} as Partial<Repository<College>>;
    const mockUserRepo = {} as Partial<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollegeController],
      providers: [
        CollegeService,
        { provide: getRepositoryToken(College), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    controller = module.get<CollegeController>(CollegeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
