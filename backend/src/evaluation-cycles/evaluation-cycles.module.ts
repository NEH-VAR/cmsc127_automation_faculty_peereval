import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCyclesService } from './evaluation-cycles.service';
import { EvaluationCyclesController } from './evaluation-cycles.controller';
import { EvaluationCycle } from './entities/evaluation-cycle.entity';
import { EvaluationCycleFaculty } from './entities/evaluation-cycle-faculty.entity';
import { Nomination } from '../nominations/entities/nomination.entity';
import { Evaluation } from '../evaluations/entities/evaluation.entity';
import { EvaluationSummary } from '../evaluation-summaries/entities/evaluation-summary.entity';
import { User } from '../users/entities/user.entity';
import { EmailModule } from '../email/email.module';
import { MagicLinksModule } from '../magic-links/magic-links.module';
import { NominationsService } from 'src/nominations/nominations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationCycle, EvaluationCycleFaculty, User, Nomination, Evaluation, EvaluationSummary]),
    EmailModule,
    MagicLinksModule,
  ],
  controllers: [EvaluationCyclesController],
  providers: [EvaluationCyclesService, NominationsService],
  exports: [EvaluationCyclesService],
})
export class EvaluationCyclesModule {}