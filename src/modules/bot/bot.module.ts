import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { UserModule } from '../user/user.module';
import { EmergencyModule } from '../emergency/emergency.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [UserModule, EmergencyModule, GroupModule],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
