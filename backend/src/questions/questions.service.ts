import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { QuestionSection } from './entities/question-section.entity';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { EvaluationCycle } from '../evaluation-cycles/entities/evaluation-cycle.entity';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(QuestionSection) private readonly sectionRepo: Repository<QuestionSection>,
    @InjectRepository(EvaluationCycle) private readonly cycleRepo: Repository<EvaluationCycle>,
  ) {}

  private async ensureQuestionsUnlocked() {
    const activeCycle = await this.cycleRepo.findOne({ where: { is_active: true } });
    if (activeCycle?.questions_locked) {
      throw new BadRequestException('Questions are locked for the active evaluation cycle.');
    }
  }

  private async validateSection(sectionId: number | null | undefined) {
    if (sectionId == null) {
      return;
    }

    const section = await this.sectionRepo.findOne({
      where: { id: sectionId },
    });

    if (!section) {
      throw new BadRequestException(`Question section #${sectionId} not found`);
    }
  }

  private async normalizeSectionOrder(sectionId: number | null) {
    const rows = await this.questionRepo.find({
      where: sectionId == null ? { section_id: IsNull() } : { section_id: sectionId },
      order: { order_in_section: 'ASC', question_id: 'ASC' },
    });

    let changed = false;
    rows.forEach((row, index) => {
      if (row.order_in_section !== index) {
        row.order_in_section = index;
        changed = true;
      }
    });

    if (changed) {
      await this.questionRepo.save(rows);
    }
  }

  async create(createDto: CreateQuestionDto) {
    await this.ensureQuestionsUnlocked();
    const targetSectionId = createDto.section_id ?? null;
    await this.validateSection(targetSectionId);

    const siblingCount = await this.questionRepo.count({
      where: targetSectionId == null ? { section_id: IsNull() } : { section_id: targetSectionId },
    });

    const desiredOrder = createDto.order_in_section ?? siblingCount;
    const payload: Partial<Question> = {
      ...createDto,
      order_in_section: Math.max(0, desiredOrder),
      ...(targetSectionId == null ? {} : { section_id: targetSectionId }),
    };

    const question = this.questionRepo.create(payload);
    const saved = await this.questionRepo.save(question);
    await this.normalizeSectionOrder(targetSectionId);
    return this.questionRepo.findOneOrFail({ where: { question_id: saved.question_id }, relations: ['section'] });
  }

  findAll() {
    return this.questionRepo.find({
      relations: ['section'],
      order: { section_id: 'ASC', order_in_section: 'ASC' },
    });
  }

  async update(id: number, updateDto: UpdateQuestionDto) {
    await this.ensureQuestionsUnlocked();
    if (updateDto.section_id !== undefined) {
      await this.validateSection(updateDto.section_id);
    }

    const existing = await this.questionRepo.findOne({
      where: { question_id: id },
    });
    if (!existing) throw new NotFoundException(`Question #${id} not found`);

    const question = await this.questionRepo.preload({
      question_id: id,
      ...updateDto,
    });
    if (!question) throw new NotFoundException(`Question #${id} not found`);
    const saved = await this.questionRepo.save(question);

    const previousSectionId = existing.section_id ?? null;
    const currentSectionId = saved.section_id ?? null;

    if (previousSectionId !== currentSectionId) {
      await this.normalizeSectionOrder(previousSectionId);
      await this.normalizeSectionOrder(currentSectionId);
    } else {
      await this.normalizeSectionOrder(currentSectionId);
    }

    return this.questionRepo.findOneOrFail({ where: { question_id: saved.question_id }, relations: ['section'] });
  }

  async delete(id: number) {
    await this.ensureQuestionsUnlocked();
    const question = await this.questionRepo.findOne({
      where: { question_id: id },
    });
    if (!question) {
      throw new NotFoundException(`Question #${id} not found`);
    }
    const sectionId = question.section_id ?? null;
    await this.questionRepo.remove(question);
    await this.normalizeSectionOrder(sectionId);
    return { message: 'Question deleted.' };
  }

  async findActive() {
    return this.questionRepo.find({
      where: { is_active: true },
      relations: ['section'],
      order: { section_id: 'ASC', order_in_section: 'ASC' },
    });
  }

  async findAllWithSections() {
    return this.questionRepo.find({
      relations: ['section'],
      order: { section_id: 'ASC', order_in_section: 'ASC' },
    });
  }

  async findAllBySectionId(sectionId: number) {
    return this.questionRepo.find({
      where: { section_id: sectionId },
      order: { order_in_section: 'ASC' },
    });
  }
}