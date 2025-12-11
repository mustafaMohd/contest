import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as JwtStrategyBase, ExtractJwt } from 'passport-jwt';


@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'jwtSecret',
        });
    }

    async validate(payload: any) {
        return { id: payload.sub.id, email: payload.sub.email, role: payload.sub.role };
    }
}
