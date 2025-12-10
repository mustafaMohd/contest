import { Injectable, NotFoundException } from '@nestjs/common';
// import { DatabaseService } from '../database/database.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  private table = 'Users';

  constructor(private readonly db: DatabaseService) { }

  private async hashPassword(password: string) {
    return bcrypt.hash(password, 8);
  }

  private async compare(raw: string, hashed: string) {
    return bcrypt.compare(raw, hashed);
  }

  // === CREATE ===
  async create(dto: CreateUserDto) {
    const passwordHash = await this.hashPassword(dto.password);

    const insertData = {
      name: dto.name,
      email: dto.email,
      password_hash:passwordHash,
      role: dto.role || 'guest',
    };

    const result = await this.db
      .getKnex()(this.table)
      .insert(insertData)
      .returning('id');

    const id = result[0].id;
    return this.findOne(id);

  }

  // === FIND ALL ===
  async findAll() {
    return this.db.getKnex()(this.table).select('*');
  }
  // === FIND by Email ===
  async findEmail(email: string) {
    const user = await this.db.getKnex()(this.table)
      .where({ email })
      .first();

    return user;
  }
  // === FIND ONE ===
  async findOne(Id: number) {
    const user = await this.db.getKnex()(this.table)
      .where({ Id })
      .first();

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  // === UPDATE ===
  async update(Id: number, dto: UpdateUserDto) {
    const existing = await this.findOne(Id);

    if (!existing) throw new NotFoundException('User not found');

    const updateData: any = {
      Name: dto.Name ?? existing.Name,
      Email: dto.Email ?? existing.Email,
      Role: dto.Role ?? existing.Role,
    };

    // If password provided → hash again
    if (dto.Password) {
      updateData.PasswordHash = await this.hashPassword(dto.Password);
    }

    await this.db.getKnex()(this.table).where({ Id }).update(updateData);

    return this.findOne(Id);
  }

  // === DELETE ===
  async remove(Id: number) {
    await this.findOne(Id);
    await this.db.getKnex()(this.table).where({ Id }).del();
    return { message: 'User deleted successfully' };
  }

  // === AUTH VALIDATION ===
  async validateUser(email: string, password: string) {
    const user = await this.db.getKnex()(this.table)
      .where({ email })
      .first();

    if (!user) return null;

    const match = await this.compare(password, user.password_hash);

    return match ? user : null;
  }
}
