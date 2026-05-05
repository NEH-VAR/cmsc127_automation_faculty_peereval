import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { Answer } from './entities/answer.entity';
import { PdfServicesModule } from '../pdf-services/pdf-services.module';

@Module({
  imports: [TypeOrmModule.forFeature([Answer]), PdfServicesModule],
  controllers: [AnswersController],
  providers: [AnswersService],
  exports: [AnswersService],
})
export class AnswersModule {}