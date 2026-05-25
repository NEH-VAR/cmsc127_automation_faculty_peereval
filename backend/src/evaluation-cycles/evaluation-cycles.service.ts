import { Injectable, ConflictException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';
import { EvaluationCycleFaculty } from './entities/evaluation-cycle-faculty.entity';
import { Nomination, NominationStatus } from '../nominations/entities/nomination.entity';
import { Evaluation, EvaluationStatus } from '../evaluations/entities/evaluation.entity';
import { EvaluationSummary } from '../evaluation-summaries/entities/evaluation-summary.entity';
import { CreateEvaluationCycleDto } from './dto/create-evaluation-cycle.dto';
import { UpdateEvaluationCycleDto } from './dto/update-evaluation-cycle.dto';
import { AssignFacultyToCycleDto } from './dto/assign-faculty-to-cycle.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { EmailService } from '../email/email.service';
import { MagicLinksService } from '../magic-links/magic-links.service';
import { MagicLinkPurpose } from '../magic-links/entities/magic-link.entity';

@Injectable()
export class EvaluationCyclesService {
  private readonly logger = new Logger(EvaluationCyclesService.name);

  constructor(
    @InjectRepository(EvaluationCycle)
    private readonly cycleRepo: Repository<EvaluationCycle>,
    @InjectRepository(EvaluationCycleFaculty)
    private readonly cycleFacultyRepo: Repository<EvaluationCycleFaculty>,
    @InjectRepository(Nomination)
    private readonly nominationRepo: Repository<Nomination>,
    @InjectRepository(Evaluation)
    private readonly evaluationRepo: Repository<Evaluation>,
    @InjectRepository(EvaluationSummary)
    private readonly summaryRepo: Repository<EvaluationSummary>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly emailService: EmailService,
    private readonly magicLinksService: MagicLinksService,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateEvaluationCycleDto) {
    const semester = createDto.semester ?? 1;

    if (createDto.start_date > createDto.end_date) {
      throw new BadRequestException('End date must be on or after the start date.');
    }

    const existing = await this.cycleRepo.findOne({ where: { year: createDto.year, semester } });
    if (existing) {
      throw new ConflictException(`Evaluation cycle for year ${createDto.year}, semester ${semester} already exists.`);
    }

    const willBeActive = createDto.is_active ?? true;
    if (willBeActive) {
      const activeCycle = await this.cycleRepo.findOne({ where: { is_active: true } });
      if (activeCycle) {
        throw new ConflictException(
          `Cannot create a new active cycle while cycle #${activeCycle.cycle_id} is still active. Close the current cycle first.`,
        );
      }
    }

    const cycle = this.cycleRepo.create({
      ...createDto,
      semester,
    });

    return this.cycleRepo.save(cycle);
  }

  async getProgress(cycleId: number) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);

    const assignments = await this.cycleFacultyRepo.find({ where: { cycle_id: cycleId }, relations: ['user'] });

    const results = await Promise.all(assignments.map(async (assignment) => {
      const user = assignment.user;

      const nominations = await this.nominationRepo.find({
        where: { evaluatee_id: user.user_id, cycle_id: cycleId },
        relations: ['evaluator'],
      });

      const nominationsSubmitted = nominations.length;
      const approvedNominations = nominations.filter((n) => n.status === NominationStatus.APPROVED);

      const completedEvaluationsCount = await this.evaluationRepo.createQueryBuilder('evaluation')
        .innerJoin('evaluation.nomination', 'nomination')
        .where('nomination.evaluatee_id = :evaluateeId', { evaluateeId: user.user_id })
        .andWhere('nomination.cycle_id = :cycleId', { cycleId })
        .andWhere('evaluation.status = :completed', { completed: EvaluationStatus.COMPLETED })
        .getCount();

      const approvedWithStatus = await Promise.all(approvedNominations.map(async (n) => {
        const evaluation = await this.evaluationRepo.findOne({ where: { nomination_id: n.nomination_id } });
        return {
          nomination_id: n.nomination_id,
          evaluator_id: n.evaluator_id,
          evaluator_name: n.evaluator?.full_name,
          evaluation_completed: evaluation ? evaluation.status === EvaluationStatus.COMPLETED : false,
        };
      }));

      const summary = await this.summaryRepo.findOne({
        where: { evaluatee_id: user.user_id, cycle_id: cycleId },
      });
      const hasPdf = !!summary?.document_url;
      const pdfStatus = summary?.pdf_status ?? (hasPdf ? 'READY' : 'PENDING');

      return {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        image_base64: user.image ? user.image.toString('base64') : null,
        nominations_submitted: nominationsSubmitted,
        nominations_complete: nominationsSubmitted >= 5,
        missing_nominations: Math.max(0, 5 - nominationsSubmitted),
        nominations: nominations.map((nomination) => ({
          nomination_id: nomination.nomination_id,
          evaluator_id: nomination.evaluator_id,
          evaluator_name: nomination.evaluator?.full_name,
          evaluator_email: nomination.evaluator?.email,
          status: nomination.status,
        })),
        approved_nominations: approvedWithStatus,
        evaluations_completed_count: completedEvaluationsCount,
        summary_id: summary?.summary_id || null,
        has_pdf: hasPdf,
        pdf_status: pdfStatus,
        pdf_error: summary?.pdf_error ?? null,
      };
    }));

    return {
      cycle_id: cycleId,
      cycle_year: cycle.year,
      cycle_semester: cycle.semester,
      members: results,
    };
  }

  async update(cycleId: number, updateDto: UpdateEvaluationCycleDto) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });

    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    const nextYear = updateDto.year ?? cycle.year;
    const nextSemester = updateDto.semester ?? cycle.semester ?? 1;
    const nextStartDate = updateDto.start_date ?? (cycle.start_date ? new Date(cycle.start_date).toISOString().slice(0, 10) : null);
    const nextEndDate = updateDto.end_date ?? (cycle.end_date ? new Date(cycle.end_date).toISOString().slice(0, 10) : null);

    if (nextStartDate && nextEndDate && nextStartDate > nextEndDate) {
      throw new BadRequestException('End date must be on or after the start date.');
    }

    const existing = await this.cycleRepo.findOne({ where: { year: nextYear, semester: nextSemester } });
    if (existing && existing.cycle_id !== cycleId) {
      throw new ConflictException(`Evaluation cycle for year ${nextYear}, semester ${nextSemester} already exists.`);
    }

    const updatedCycle = this.cycleRepo.merge(cycle, updateDto);

    if (updateDto.is_active === false) {
      updatedCycle.questions_locked = false;
    }

    return this.cycleRepo.save(updatedCycle);
  }

  async findAll() {
    return this.cycleRepo.find({ order: { year: 'DESC', semester: 'DESC' } });
  }

  async assignFaculty(cycleId: number, dto: AssignFacultyToCycleDto) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    const users = await this.userRepo.find({
      where: { user_id: In(dto.faculty_ids) },
    });

    if (users.length !== dto.faculty_ids.length) {
      throw new BadRequestException('One or more faculty IDs do not exist.');
    }

    const nonFacultyUsers = users.filter((u) => u.role !== UserRole.FACULTY);
    if (nonFacultyUsers.length > 0) {
      throw new BadRequestException(
        `The following users are not faculty: ${nonFacultyUsers.map((u) => u.user_id).join(', ')}`,
      );
    }

    await this.cycleFacultyRepo.delete({ cycle_id: cycleId });

    const assignments = dto.faculty_ids.map((user_id) =>
      this.cycleFacultyRepo.create({
        cycle_id: cycleId,
        user_id,
      }),
    );

    await this.cycleFacultyRepo.save(assignments);

    return {
      message: `Successfully assigned ${assignments.length} faculty members to cycle #${cycleId}.`,
      assigned_count: assignments.length,
      cycle_id: cycleId,
    };
  }

  async getAssignedFaculty(cycleId: number) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    const assignments = await this.cycleFacultyRepo.find({
      where: { cycle_id: cycleId },
      relations: ['user'],
    });

    return assignments.map((assignment) => ({
      assignment_id: assignment.assignment_id,
      user_id: assignment.user_id,
      user: {
        user_id: assignment.user?.user_id,
        full_name: assignment.user?.full_name,
        email: assignment.user?.email,
        image_base64: assignment.user?.image ? assignment.user.image.toString('base64') : null,
      },
    }));
  }

  async sendNominationEmails(cycleId: number) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    const assignments = await this.cycleFacultyRepo.find({
      where: { cycle_id: cycleId },
      relations: ['user'],
    });

    if (assignments.length === 0) {
      throw new BadRequestException(`No faculty assigned to cycle #${cycleId}.`);
    }

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (!frontendUrl) {
      throw new Error('FRONTEND_URL must be set to send nomination emails.');
    }

    const sentCount = { success: 0, failed: 0 };
    const failedFaculty: Array<{ user_id: number; email: string; error: string }> = [];

    for (const assignment of assignments) {
      try {
        const user = assignment.user;

        const magicLink = await this.magicLinksService.createLink({
          user_id: user.user_id,
          purpose: MagicLinkPurpose.NOMINATION,
          reference_id: cycle.cycle_id,
        });

        const magicLinkUrl = `${frontendUrl}/nominate?token=${magicLink.token_hash}`;

        await this.emailService.sendNominationMagicLinkEmail(
          user.email,
          user.full_name,
          magicLinkUrl,
          `Year ${cycle.year}, Semester ${cycle.semester ?? 1}`,
        );

        sentCount.success++;
        this.logger.log(
          `Nomination email sent to faculty #${user.user_id} (${user.email}) for cycle #${cycleId}.`,
        );
      } catch (error) {
        sentCount.failed++;
        failedFaculty.push({
          user_id: assignment.user_id,
          email: assignment.user.email,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        this.logger.error(
          `Failed to send nomination email to faculty #${assignment.user_id} (${assignment.user.email}): ${error}`,
        );
      }
    }

    if (sentCount.failed > 0) {
      this.logger.warn(
        `Nomination email sending completed with ${sentCount.success} successes and ${sentCount.failed} failures.`,
      );
    }

    return {
      message: 'Nomination emails sent.',
      cycle_id: cycleId,
      cycle_year: cycle.year,
      cycle_semester: cycle.semester,
      sent_count: sentCount.success,
      failed_count: sentCount.failed,
      failed_faculty: failedFaculty.length > 0 ? failedFaculty : undefined,
    };
  }

  async startForms(cycleId: number) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    if (!cycle.is_active) {
      throw new BadRequestException('Only active cycles can start forms.');
    }

    if (cycle.forms_started_at) {
      return {
        message: 'Forms have already been started for this cycle.',
        cycle_id: cycleId,
        forms_started_at: cycle.forms_started_at,
      };
    }

    if (cycle.questions_locked) {
      throw new BadRequestException('Questions are already finalized for this cycle.');
    }

    cycle.forms_started_at = new Date();
    await this.cycleRepo.save(cycle);

    return {
      message: 'Forms started for this cycle.',
      forms_started_at: cycle.forms_started_at,
      cycle_id: cycleId,
    };
  }

  async finalizeQuestions(cycleId: number) {
    const cycle = await this.cycleRepo.findOne({ where: { cycle_id: cycleId } });
    if (!cycle) {
      throw new NotFoundException(`Evaluation cycle #${cycleId} not found.`);
    }

    if (!cycle.is_active) {
      throw new BadRequestException('Only active cycles can finalize questions.');
    }

    if (cycle.questions_locked) {
      return {
        message: 'Questions are already finalized for this cycle.',
        cycle_id: cycleId,
        questions_locked: true,
      };
    }

    if (!cycle.forms_started_at) {
      cycle.forms_started_at = new Date();
    }

    cycle.questions_locked = true;
    await this.cycleRepo.save(cycle);

    const emailResult = await this.sendNominationEmails(cycleId);

    return {
      message: 'Questions finalized for this cycle. Nomination emails sent.',
      cycle_id: cycleId,
      questions_locked: true,
      forms_started_at: cycle.forms_started_at,
      sent_count: emailResult.sent_count,
      failed_count: emailResult.failed_count,
      failed_faculty: emailResult.failed_faculty,
    };
  }
}
