import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateContestDto } from './dto/create-contest.dto';
import { UpdateContestDto } from './dto/update-contest.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitAnswersDto } from './dto/submit-answers.dto';

@Injectable()
export class ContestService {
  private table = 'Contests';

  constructor(private readonly db: DatabaseService) { }

  // === CREATE ===
  async create(dto: CreateContestDto) {
    const result = await this.db.getKnex()(this.table)
      .insert(dto)
      .returning('id');

    const id = result[0].id;
    return this.findOne(id);
  }

  // === FIND ALL with role-based access ===
  async findAll(user: any) {
    let query = this.db.getKnex()(this.table).orderBy('start_time', 'desc');

    if (user.role === 'user') {
      query = query.where({ access_level: 'normal' });
    }

    return query;
  }

  // === FIND ONE ===
  async findOne(id: string) {
    const contest = await this.db.getKnex()(this.table)
      .where({ id })
      .first();

    if (!contest) throw new NotFoundException('Contest not found');

    return contest;
  }

  // === UPDATE ===
  async update(id: string, dto: UpdateContestDto) {
    const existing = await this.findOne(id);

    const updateData = {
      name: dto.name ?? existing.name,
      description: dto.description ?? existing.description,
      start_time: dto.start_time ?? existing.start_time,
      end_time: dto.end_time ?? existing.end_time,
      prize: dto.prize ?? existing.prize,
      access_level: dto.access_level ?? existing.access_level,
    };

    await this.db.getKnex()(this.table).where({ id }).update(updateData);

    return this.findOne(id);
  }

  // === DELETE ===
  async remove(id: string) {
    await this.findOne(id);
    await this.db.getKnex()(this.table).where({ id }).del();
    return { message: 'Contest deleted successfully' };
  }
  async getContestsForUser(user: any) {
    let query = this.db.getKnex()('contests').select('*');

    if (!user) {
      // Guest users: can only view contests but not participate
      query = query.where({ accessLevel: 'public' });
    } else if (user.role === 'admin' || user.role === 'vip') {
      // Admin & VIP: access all contests
      query = query;
    } else {
      // Normal signed-in user: only normal contests
      query = query.where({ accessLevel: 'normal' });
    }

    return query;
  }
  async getContestForUser(contestId: string, user: any) {
    const contest = await this.db.getKnex()('contests')
      .where({ id: contestId })
      .first();

    if (!contest) throw new NotFoundException('Contest not found');

    if (!user) {
      if (contest.accessLevel !== 'public') {
        throw new ForbiddenException('You must log in to access this contest');
      }
    } else if (user.role === 'normal' && contest.accessLevel === 'vip') {
      throw new ForbiddenException('Normal users cannot access VIP contests');
    }

    return contest;
  }
  async addQuestion(dto: CreateQuestionDto) {
    // Check if contest exists
    const contest = await this.db.getKnex()('contests')
      .where({ id: dto.contestId })
      .first();

    if (!contest) throw new NotFoundException('Contest not found');

    const [id] = await this.db.getKnex()('questions')
      .insert({
        contest_id: dto.contestId,
        question_text: dto.questionText,
        type: dto.type,
        options: JSON.stringify(dto.options),
        correct_answers: JSON.stringify(dto.correctAnswers),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id');

    return this.db.getKnex()('questions')
      .where({ id: id.id || id }) // depending on DB return
      .first();
  }
  async updateQuestion(questionId: string, dto: UpdateQuestionDto) {
    const existing = await this.db.getKnex()('questions')
      .where({ id: questionId })
      .first();

    if (!existing) throw new NotFoundException('Question not found');

    // Convert DTO → DB format
    const updateData: any = {};

    if (dto.questionText !== undefined) updateData.question_text = dto.questionText;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.options !== undefined) updateData.options = JSON.stringify(dto.options);
    if (dto.correctAnswers !== undefined) updateData.correct_answers = JSON.stringify(dto.correctAnswers);

    updateData.updated_at = new Date();

    await this.db.getKnex()('questions')
      .where({ id: questionId })
      .update(updateData);

    return this.db.getKnex()('questions')
      .where({ id: questionId })
      .first();
  }
  async getQuestionsByContestwithoutAnswers(contest_id: string) {
    const questions = await this.db.getKnex()('questions')
      .where({ contest_id });

    return questions.map(({ correct_answers, ...q }) => ({
      ...q,
      options: q.options ? JSON.parse(q.options) : [],
      // correct_answers is excluded
    }));
  }
  async getQuestionsByContest(contest_id: string, includeAnswers = false) {
    const questions = await this.db.getKnex()('questions')
      .where({ contest_id });

    return questions.map(q => ({
      ...q,
      options: JSON.parse(q.options),
      ...(includeAnswers ? { correct_answers: JSON.parse(q.correct_answers) } : {}),
    }));
  }
  // ===== Participation / Submit Answers =====
  async submitAnswers(userId: string, dto: SubmitAnswersDto) {
    const contest = await this.findOne(dto.contestId);

    const questions = await this.getQuestionsByContest(dto.contestId);

    let score = 0;
    for (const q of questions) {
      const userAnswer = dto.answers.find(a => a.questionId === q.id)?.answer;
      const correctAnswers = JSON.parse(q.correct_answers);
      if (!userAnswer) continue;
      if (q.type === 'single' || q.type === 'truefalse') {
        if (userAnswer === correctAnswers[0]) score++;
      } else if (q.type === 'multi') {
        if (
          Array.isArray(userAnswer) &&
          JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswers.sort())
        ) {
          score++;
        }
      }
    }

    const [participationId] = await this.db.getKnex()('participations')
      .insert({
        user_id: userId,
        contest_id: dto.contestId,
        answers: JSON.stringify(dto.answers),
        score,
        submitted_at: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('id');

    // Winner logic: safely handle maxScore
    const maxScoreRow = await this.db.getKnex()('participations')
      .where({ contest_id: dto.contestId })
      .max('score as maxScore')
      .first();

    const maxScore = maxScoreRow?.maxScore ?? 0; // default 0 if undefined

    if (score === maxScore) {
      await this.db.getKnex()('prizes').insert({
        user_id: userId,
        contest_id: dto.contestId,
        prize: contest.prize,
        won_at: new Date(),
      });
    }

    return { participationId: participationId.id || participationId, score };
  }

}
