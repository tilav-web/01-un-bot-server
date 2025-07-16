import { IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AdminRole } from '../schemas/admin-user.schema';

export class CreateAdminUserDto {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6) // Minimum password length
  password: string;

  @IsEnum(AdminRole)
  @IsNotEmpty()
  role: AdminRole;
}
