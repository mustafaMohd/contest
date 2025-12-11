import { Module } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { ParticipationController } from './participation.controller';
import { DatabaseService } from 'src/database/database.service';

@Module({
  controllers: [ParticipationController],
  providers: [ParticipationService, DatabaseService],
  exports: [ParticipationService],
})
export class ParticipationModule { }
