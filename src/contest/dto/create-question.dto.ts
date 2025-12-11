// src/contest/dto/create-question.dto.ts
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsArray } from 'class-validator';

export enum QuestionType {
  SINGLE = 'single-select',
  MULTI = 'multi-select',
  TRUE_FALSE = 'true-false',
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  contestId: string;

  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsArray()
  @IsOptional()
  options?: string[];

  @IsArray()
  @IsNotEmpty()
  correctAnswers: string[];
}
