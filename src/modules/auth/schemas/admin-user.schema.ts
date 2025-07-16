import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminUserDocument = AdminUser & Document;

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class AdminUser {
  @Prop({ required: true, unique: true })
  uid: string; // Telegram ID or any unique identifier for the admin user

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(AdminRole),
    default: AdminRole.ADMIN,
  })
  role: AdminRole;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);
