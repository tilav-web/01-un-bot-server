import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'active',
  NOT_ACTIVE = 'not_active',
  BLOCK = 'block',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  telegram_id: number;

  @Prop({ required: true })
  full_name: string;

  @Prop()
  username: string;

  @Prop()
  phone: string;

  @Prop({
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Prop({ type: String, default: null })
  action: string;

  @Prop({ type: Number, default: null })
  action_message_id: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
