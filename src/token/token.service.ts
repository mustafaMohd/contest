import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTokenDto } from '../auth/dto/createToken.dto';

@Injectable()
export class TokenService {
  private table = 'tokens';

  constructor(private readonly db: DatabaseService) {}

  async create(token: CreateTokenDto): Promise<any> {
    const [row] = await this.db.getKnex()(this.table)
      .insert(token)
      .returning('id');

    return this.findOne(row.id);
  }

  async findOne(id: string): Promise<any> {
    const result = await this.db.getKnex()(this.table).where({ id:id }).first();
    return result;
  }

  async findByToken(tokenStr: string, type: 'access' | 'refresh'): Promise<any> {
    return this.db.getKnex()(this.table)
      .where({ token: tokenStr, type, blacklisted: false })
      .first();
  }

  async blacklist(tokenId: number) {
    await this.db.getKnex()(this.table)
      .where({ id: tokenId })
      .update({ blacklisted: true });
  }

  async delete(tokenId: number) {
    await this.db.getKnex()(this.table)
      .where({ id: tokenId })
      .del();
  }
}
