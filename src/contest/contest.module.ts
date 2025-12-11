import { Module } from '@nestjs/common';
import { ContestController } from './contest.controller';
import { ContestService } from './contest.service';
import { DatabaseModule } from '../database/database.module';

@Module({
   imports: [DatabaseModule],
  controllers: [ContestController],
  providers: [ContestService]
})
export class ContestModule {}
