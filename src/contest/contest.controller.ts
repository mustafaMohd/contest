import { Controller, Get, Param, Req, UseGuards, HttpException, HttpStatus, Delete, Body, Patch, Post } from '@nestjs/common';
import { ContestService } from './contest.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateContestDto } from './dto/update-contest.dto';
import { CreateContestDto } from './dto/create-contest.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { SubmitAnswersDto } from './dto/submit-answers.dto';
@Controller('contests')
export class ContestController {
    constructor(private readonly contestService: ContestService) { }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post()
    create(@Body() dto: CreateContestDto) {
        return this.contestService.create(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Post('question')
    addQuestion(@Body() dto: CreateQuestionDto) {
        return this.contestService.addQuestion(dto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @Patch('question/:id')
    async updateQuestion(
        @Param('id') id: string,
        @Body() dto: UpdateQuestionDto,
    ) {
        return this.contestService.updateQuestion(id, dto);
    }
    // @Get()
    // findAll(@Req() req) {
    //     return this.contestService.findAll(req.user || null);
    // }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.contestService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    update(@Param('id') id: string, @Body() dto: UpdateContestDto) {
        return this.contestService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    remove(@Param('id') id: string) {
        return this.contestService.remove(id);
    }
    /**
     * Get all contests accessible by the user
     * Guests can access normal contests, signed-in users filtered by role
     */
    @Get()
    @UseGuards(JwtAuthGuard) // optional: remove if you want guests to access too
    async getContests(@Req() req: any) {
        try {
            const user = req.user || null;
            const contests = await this.contestService.getContestsForUser(user);
            return { contests };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
        }
    }


    @Get(':id')
    @UseGuards(JwtAuthGuard) // optional: remove if you want guests to access normal contests
    async getContest(@Param('id') id: string, @Req() req: any) {
        try {
            const user = req.user || null;
            const contest = await this.contestService.getContestForUser(id, user);
            return { contest };
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.FORBIDDEN);
        }
    }
    @UseGuards(JwtAuthGuard)
    @Get(':contestId/questions')
    async getQuestions(@Param('contestId') contestId: string) {
        return this.contestService.getQuestionsByContestwithoutAnswers(contestId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Post('submit')
    submitAnswers(@Req() req: any, @Body() dto: SubmitAnswersDto) {
        return this.contestService.submitAnswers(req.user.id, dto);
    }

}
