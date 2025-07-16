import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/user/schemas/user.schema';

export type EmergencyDocument = Emergency & Document;

export enum EmergencyStatus {
  CONFIRMED = 'confirmed',
  CANCELED = 'canceled',
  PENDING = 'pending',
}

export enum EmergencyType {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  FAKE = 'FAKE',
}

@Schema({ timestamps: true })
export class Emergency {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  user_message_id: number;

  @Prop()
  group_message_id: number;

  @Prop({ type: String })
  message_type?: string;

  @Prop({ type: String })
  message_content?: string;

  @Prop({
    type: String,
    enum: Object.values(EmergencyStatus),
    required: true,
  })
  status: EmergencyStatus;

  @Prop({
    type: String,
    enum: Object.values(EmergencyType),
    default: EmergencyType.PENDING,
  })
  type: EmergencyType;
}

export const EmergencySchema = SchemaFactory.createForClass(Emergency);
