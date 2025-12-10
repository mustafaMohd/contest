import { IsNotEmpty, IsEnum, IsInt, IsDate, IsOptional, IsString } from 'class-validator';



export class CreateTokenDto {
  @IsNotEmpty()
  token: string;

  @IsInt()
  user_id: string;

  @IsString()
  type: string;

  @IsDate()
  expires_in: Date;

  @IsOptional()
  blacklisted?: boolean;
}
