import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import moment from 'moment';
import { ConfigService } from '../config/config.service';
import { TokenService } from '../token/token.service';
import { UsersService } from 'src/users/users.service';
import { tokenTypes } from './constants/token.constants';
import { JwtPayload } from 'jsonwebtoken';
// import { TokenService } from '../token/token.service';
// import { UsersService } from '../user/users.service';


@Injectable()
export class AuthService {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly tokenService: TokenService,
        private readonly usersService: UsersService,
    ) { }

 generateToken(
  user: any,
  expiresIn: number | string, // e.g. 900 or '15m'
  type: 'access' | 'refresh',
): string {
  const payload = {
    sub: user, // convert to string
    type,
  };

  // Type-safe options
  const options: JwtSignOptions = { expiresIn: expiresIn as any };

  return this.jwtService.sign(payload, options);
}


    async saveToken(
        token: string,
        userId: string,
        expiresIn: Date,
        type: string,  // enum type
        blacklisted = false,
    ) {
        return this.tokenService.create({
            token,
            user_id: userId,
            type,            // tokenTypes.ACCESS or tokenTypes.REFRESH
            expires_in: expiresIn,
            blacklisted,
        });
    }


    async logout(refreshToken: string) {
        const token = await this.tokenService.findByToken(refreshToken, tokenTypes.REFRESH);
        if (!token) throw new HttpException('Not found', HttpStatus.NOT_FOUND);
        await this.tokenService.delete(token.id);
    }

    async refreshAuth(refreshToken: string) {
        const token = await this.tokenService.findByToken(refreshToken, tokenTypes.REFRESH);
        if (!token) throw new HttpException('Please authenticate', HttpStatus.UNAUTHORIZED);

        const user = await this.usersService.findOne(token.user_id);
        if (!user) throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);

        await this.tokenService.delete(token.id); // invalidate old refresh token

        return this.generateAuthTokens(user);
    }

    async generateAuthTokens(user: any) {
        const accessTokenExpires = moment().add(this.configService.jwt.expiresIn); // using jwt config
        const accessToken = this.generateToken(
            user,
            this.configService.jwt.expiresIn,
            tokenTypes.ACCESS,
        );

        const refreshTokenExpires = moment().add('7d'); // example refresh expiry
        const refreshToken = this.generateToken(
            user,
            '7d',
            tokenTypes.REFRESH,
        );

        await this.saveToken(
            refreshToken,
            user.id,
            refreshTokenExpires.toDate(),
            tokenTypes.REFRESH,
        );

        return {
            access: { token: accessToken, expiresIn: accessTokenExpires.toDate() },
            refresh: { token: refreshToken, expiresIn: refreshTokenExpires.toDate() },
        };
    }


}
