import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsMongoId,
  IsString,
  IsOptional,
} from 'class-validator';
import { Types } from 'mongoose';
import { EmergencyStatus, EmergencyType } from '../schemas/emergency.schema';

export class CreateEmergencyDto {
  @IsMongoId()
  @IsNotEmpty()
  user: Types.ObjectId;

  @IsNumber()
  @IsNotEmpty()
  user_message_id: number;

  @IsNumber()
  group_message_id: number;

  @IsString()
  @IsOptional()
  message_type?: string;

  @IsString()
  @IsOptional()
  message_content?: string;

  @IsEnum(EmergencyStatus)
  @IsNotEmpty()
  status: EmergencyStatus;

  @IsEnum(EmergencyType)
  @IsNotEmpty()
  type: EmergencyType;
}
