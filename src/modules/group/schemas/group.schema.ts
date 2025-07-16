import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GroupDocument = Group & Document;

export enum GroupStatus {
  ACTIVE = 'active',
  NOT_ACTIVE = 'not_active',
  BLOCKED = 'blocked',
}

@Schema()
export class Group {
  @Prop({ required: true, unique: true })
  group: number;

  @Prop({ required: true })
  telegram_id: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  username?: string;

  @Prop({ required: true, enum: GroupStatus, default: GroupStatus.ACTIVE })
  status: GroupStatus;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
