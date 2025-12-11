import { IsString, IsArray } from 'class-validator';

export class SubmitAnswersDto {
  @IsString() contestId: string;
  @IsArray() answers: { questionId: string; answer: string | string[] }[];
}
