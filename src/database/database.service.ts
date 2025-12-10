import { Injectable } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import knex, { Knex } from 'knex';

@Injectable()
export class DatabaseService {
  private knexInstance: Knex;

  constructor(private configService: ConfigService) {
    const dbConfig = this.configService.db; // from config module

    this.knexInstance = knex({
      client: 'mssql',
      connection: dbConfig.connection,
      pool: dbConfig.pool,
    });
  }

  getKnex(): Knex {
    return this.knexInstance;
  }
}
