import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  get appName(): string {
    return this.configService.get<string>('appName') ?? 'Nest App';
  }

  get port(): number {
    return this.configService.get<number>('port') ?? 3000;
  }

  get db() {
    return this.configService.get('db') ?? {
      host: 'localhost',
      port: 1433,
      username: 'sa',
      password: 'Admin@12345',
      database: 'Contest',
    };
  }

  get jwt() {
    return this.configService.get('jwt') ?? {
      secret: 'jwtSecret',
      expiresIn: '1d',
    };
  }
}
