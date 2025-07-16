import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { MailingController } from './mailing.controller';
import { BotModule } from 'src/modules/bot/bot.module';
import { UserModule } from 'src/modules/user/user.module';
import { GroupModule } from 'src/modules/group/group.module';

@Module({
  imports: [BotModule, UserModule, GroupModule],
  controllers: [MailingController],
  providers: [MailingService],
})
export class MailingModule {}
