import { IsArray, IsOptional, IsString } from 'class-validator';

export class SendGroupMessageDto {
  @IsArray()
  @IsString({ each: true })
  groupIds: string[];

  @IsOptional()
  @IsString()
  text?: string;
}
