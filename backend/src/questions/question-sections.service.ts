import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionSection } from './entities/question-section.entity';
import { CreateQuestionSectionDto } from './dto/create-question-section.dto';
import { UpdateQuestionSectionDto } from './dto/update-question-section.dto';
import { EvaluationCycle } from '../evaluation-cycles/entities/evaluation-cycle.entity';

@Injectable()
export class QuestionSectionsService {
  constructor(
    @InjectRepository(QuestionSection) private readonly sectionRepo: Repository<QuestionSection>,
    @InjectRepository(EvaluationCycle) private readonly cycleRepo: Repository<EvaluationCycle>,
  ) {}

  private async ensureQuestionsUnlocked() {
    const activeCycle = await this.cycleRepo.findOne({ where: { is_active: true } });
    if (activeCycle?.questions_locked) {
      throw new BadRequestException('Questions are locked for the active evaluation cycle.');
    }
  }

  async create(createDto: CreateQuestionSectionDto) {
    await this.ensureQuestionsUnlocked();
    // Check if section with same name already exists
    const existing = await this.sectionRepo.findOne({
      where: { name: createDto.name },
    });

    if (existing) {
      throw new ConflictException(`Section "${createDto.name}" already exists`);
    }

    const section = this.sectionRepo.create(createDto);
    return this.sectionRepo.save(section);
  }

  async findAll() {
    return this.sectionRepo.find({
      order: { order: 'ASC' },
      relations: ['questions'],
    });
  }

  async findById(id: number) {
    const section = await this.sectionRepo.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!section) {
      throw new NotFoundException(`Question section #${id} not found`);
    }

    return section;
  }

  async update(id: number, updateDto: UpdateQuestionSectionDto) {
    await this.ensureQuestionsUnlocked();
    const section = await this.sectionRepo.preload({
      id,
      ...updateDto,
    });

    if (!section) {
      throw new NotFoundException(`Question section #${id} not found`);
    }

    // If name is being updated, check for duplicates
    if (updateDto.name) {
      const existing = await this.sectionRepo.findOne({
        where: { name: updateDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Section "${updateDto.name}" already exists`);
      }
    }

    return this.sectionRepo.save(section);
  }

  async delete(id: number) {
    await this.ensureQuestionsUnlocked();
    const section = await this.findById(id);
    return this.sectionRepo.remove(section);
  }

  async findByName(name: string) {
    return this.sectionRepo.findOne({
      where: { name },
      relations: ['questions'],
    });
  }

  async findQuestionsInSection(sectionId: number) {
    const section = await this.findById(sectionId);
    return section.questions || [];
  }
}
