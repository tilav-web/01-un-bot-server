import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserStatus } from '../schemas/user.schema';

export class CreateUserDto {
  @IsNumber()
  @IsNotEmpty()
  telegram_id: number;

  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
