import { IsArray, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
  @IsArray()
  @IsString({ each: true })
  userIds: string[]; // Array of user IDs to send the message to. Can be empty if sending to all.

  @IsOptional()
  @IsString()
  text?: string; // Caption for media or text message itself
}
