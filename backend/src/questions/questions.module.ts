import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionsService } from './questions.service';
import { QuestionsController } from './questions.controller';
import { QuestionSectionsService } from './question-sections.service';
import { QuestionSectionsController } from './question-sections.controller';
import { Question } from './entities/question.entity';
import { QuestionSection } from './entities/question-section.entity';
import { EvaluationCycle } from '../evaluation-cycles/entities/evaluation-cycle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, QuestionSection, EvaluationCycle])],
  controllers: [QuestionsController, QuestionSectionsController],
  providers: [QuestionsService, QuestionSectionsService],
  exports: [QuestionsService, QuestionSectionsService],
})
export class QuestionsModule {}