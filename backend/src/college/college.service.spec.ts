import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollegeService } from './college.service';
import { College } from './entities/college.entity';
import { User } from '../users/entities/user.entity';

describe('CollegeService', () => {
  let service: CollegeService;

  beforeEach(async () => {
    const mockRepo = {} as Partial<Repository<College>>;
    const mockUserRepo = {} as Partial<Repository<User>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollegeService,
        { provide: getRepositoryToken(College), useValue: mockRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<CollegeService>(CollegeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
