
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateContestDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  start_time: string; // ISO date string

  @IsDateString()
  end_time: string;   // ISO date string

  @IsString()
  @IsOptional()
  prize?: string;

  @IsString()
  @IsIn(['normal', 'vip'])
  access_level: string; // normal or vip
}
