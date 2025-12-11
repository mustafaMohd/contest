import { Controller, Get, UseGuards, Request, Post, Req, Param } from '@nestjs/common';
import { ParticipationService } from './participation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('participation')
export class ParticipationController {
    constructor(private readonly participationService: ParticipationService) { }

    // === User completed history ===
    @UseGuards(JwtAuthGuard)
    @Get('history')
    async getUserHistory(@Request() req) {
        return this.participationService.getUserHistory(req.user.id);
    }
    @UseGuards(JwtAuthGuard)
    @Post(':contestId/start')
    async startContest(@Req() req: any, @Param('contestId') contestId: string) {
        return this.participationService.startContest(req.user.id, contestId);
    }
    // === In-progress contests ===
    @UseGuards(JwtAuthGuard)
    @Get('in-progress')
    async getInProgress(@Request() req) {
        return this.participationService.getInProgressContests(req.user.id);
    }

    // === Won prizes ===
    @UseGuards(JwtAuthGuard)
    @Get('prizes')
    async getPrizes(@Request() req) {
        return this.participationService.getWonPrizes(req.user.id);
    }
}
