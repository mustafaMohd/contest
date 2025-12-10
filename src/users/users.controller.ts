import { Controller, Get, Post, Patch, Delete, Param, Body, HttpStatus, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() dto: CreateUserDto) {
    const existing = await this.usersService.findEmail(dto.email);

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const user = await this.usersService.create(dto);
    // Remove passwordHash
    delete user.passwordHash;
    return {
      statusCode: HttpStatus.OK,
      message: 'User created successfully',
      data: user,
    };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(Number(id));
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }
}
