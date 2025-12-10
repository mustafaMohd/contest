import { BadRequestException, Body, Controller, HttpException, HttpStatus, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginPayload } from './dto/login.dto';
import { LogoutPayload } from './dto/logout.dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly usersService: UsersService,
        private readonly authService: AuthService,
    ) { }

    @Post('register')
    async register(
        @Req() req: Request,
        @Res() res: Response,
        @Body() payload: RegisterUserDto,
    ) {
        try {
            const existing = await this.usersService.findEmail(payload.email);

            if (existing) {
                throw new BadRequestException('Email already registered');
            }

            const user = await this.usersService.create(payload);
            delete user.password_hash;
            const tokens = await this.authService.generateAuthTokens(user);
            return res.status(HttpStatus.CREATED).send({ user, tokens });
        } catch (error) {
            // Log error if needed
            console.error('Registration error:', error);

            // If it's a NestJS exception, rethrow
            if (error instanceof HttpException) {
                throw error;
            }

            // Otherwise, send a generic 500 response
            return res
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .send({ message: 'Something went wrong', error: error.message });
        }
    }

    @Post('login')
    async login(@Res() res: Response, @Body() payload: LoginPayload) {
        const user = await this.usersService.validateUser(payload.email,payload.password);
        if (!user) {
            throw new UnauthorizedException('Could not authenticate. Please try again.');
        }
        delete user.password_hash;
        const tokens = await this.authService.generateAuthTokens(user);
        res.status(HttpStatus.OK).send({ user, tokens });
    }
    @Post('logout')
    async logout(@Res() res: Response, @Body() payload: LogoutPayload) {
        await this.authService.logout(payload.refreshToken);
        res.status(HttpStatus.NO_CONTENT).send();
    }
    @Post('refreshAuth')
    async refreshAuth(@Res() res: Response, @Body() payload: LogoutPayload) {
        const tokens = await this.authService.refreshAuth(payload.refreshToken);
        res.status(HttpStatus.OK).send({ ...tokens });
    }

}
