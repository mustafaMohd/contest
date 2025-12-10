import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ConfigModule } from 'src/config/config.module';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { ConfigService } from 'src/config/config.service';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

// @Module({
//   imports: [UsersModule],
//   providers: [AuthService],
//   controllers: [AuthController]
// })
@Module({
  imports: [
    ConfigModule,   
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwt.secret || 'jwtSecret', // must provide a value
        signOptions: { expiresIn: configService.jwt.expiresIn || '1d' },
      }),
    }), 
    TokenModule,
    UsersModule,
    PassportModule
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
    JwtStrategy,
  ],
  providers: [AuthService,JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
