import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { EmergencyService } from 'src/modules/emergency/emergency.service';

import { handleEmergencyMessage } from './utils/messages/emergency-handler';

export const messageEvent = (
  bot: Bot,
  userService: UserService,
  emergencyService: EmergencyService,
) => {
  bot.on('message', async (ctx) => {
    if (await handleEmergencyMessage(ctx, bot, userService, emergencyService)) {
      return;
    }
  });
};
