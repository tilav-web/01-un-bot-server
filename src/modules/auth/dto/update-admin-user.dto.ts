import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateAdminUserDto {
  @IsString()
  @IsOptional()
  uid?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;
}
