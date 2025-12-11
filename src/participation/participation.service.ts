import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ParticipationService {
    constructor(private readonly db: DatabaseService) { }
    async startContest(userId: string, contestId: string) {
        const existing = await this.db.getKnex()('participations')
            .where({ user_id: userId, contest_id: contestId })
            .first();

        if (existing) {
            return existing; // already started
        }

        const [participationId] = await this.db.getKnex()('participations')
            .insert({
                user_id: userId,
                contest_id: contestId,
                answers: JSON.stringify([]), // empty initially
                score: 0,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning('id');

        return { participationId: participationId.id || participationId };
    }

    // User's participation history (completed contests)
    async getUserHistory(userId: string) {
        return this.db.getKnex()('participations as p')
            .where({ 'p.user_id': userId })
            .whereNotNull('p.submitted_at') // use whereNotNull
            .join('contests as c', 'p.contest_id', 'c.id')
            .select(
                'c.id as contestId',
                'c.name as contestName',
                'c.prize',
                'p.score',
                'p.submitted_at'
            )
            .orderBy('p.submitted_at', 'desc');
    }


    // Contests user joined but not submitted answers yet
    async getInProgressContests(userId: string) {
        return this.db.getKnex()('participations as p')
            .where({ 'p.user_id': userId })
            .whereNull('p.submitted_at')  // use whereNull instead of andWhereNull
            .join('contests as c', 'p.contest_id', 'c.id')
            .select(
                'c.id as contestId',
                'c.name as contestName',
                'c.start_time',
                'c.end_time'
            )
            .orderBy('c.start_time', 'asc');
    }


    // List of prizes won by the user
    async getWonPrizes(userId: string) {
        return this.db.getKnex()('prizes as pr')
            .where({ 'pr.user_id': userId })
            .join('contests as c', 'pr.contest_id', 'c.id')
            .select(
                'c.id as contestId',
                'c.name as contestName',
                'pr.prize',
                'pr.won_at'
            )
            .orderBy('pr.won_at', 'desc');
    }

    // Check if a participation exists for a user in a contest
    async checkParticipation(userId: string, contestId: string) {
        const participation = await this.db.getKnex()('participations')
            .where({ user_id: userId, contest_id: contestId })
            .first();
        return participation;
    }
}
