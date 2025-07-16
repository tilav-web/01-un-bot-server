import { IsString, IsNotEmpty, IsNumber, IsEnum } from 'class-validator';
import { GroupStatus } from '../schemas/group.schema';

export class CreateGroupDto {
  @IsNumber()
  @IsNotEmpty()
  readonly group: number;

  @IsNumber()
  @IsNotEmpty()
  readonly telegram_id: number;

  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  readonly username?: string;

  @IsEnum(GroupStatus)
  @IsNotEmpty()
  readonly status: GroupStatus;
}
