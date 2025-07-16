import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AdminUser, AdminUserSchema } from './schemas/admin-user.schema';
import { JwtStrategy } from './strategies/jwt.strategy';
import { config } from 'dotenv';
import { BotModule } from '../bot/bot.module';
import { UserModule } from '../user/user.module';

config();

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret', // TODO: Use a strong secret from environment variables
      signOptions: { expiresIn: '60m' },
    }),
    forwardRef(() => BotModule),
    forwardRef(() => UserModule),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule], // Export JwtModule for other modules to use JWT services
})
export class AuthModule {}
