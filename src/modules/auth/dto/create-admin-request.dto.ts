import { IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';

export class CreateAdminRequestDto {
  @IsNumber()
  @IsNotEmpty()
  telegram_id: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
