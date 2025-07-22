import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { EmergencyService } from 'src/modules/emergency/emergency.service';
import { EmergencyStatus } from 'src/modules/emergency/schemas/emergency.schema';
import { Types } from 'mongoose';

import { handleEmergencyMessage } from './utils/messages/emergency-handler';

export const messageEvent = (
  bot: Bot,
  userService: UserService,
  emergencyService: EmergencyService,
) => {
  bot.on('message', async (ctx) => {
    const user = await userService.findOne(ctx.from.id);

    if (user && user.action !== 'awaiting_emergency_message') {
      const pendingEmergency = await emergencyService.findPendingEmergencyByUserId(new Types.ObjectId(user._id.toString()));
      if (pendingEmergency) {
        await ctx.reply('Sizda hali tasdiqlanmagan xabar bor. Iltimos, avvalgi xabaringizni tasdiqlang yoki bekor qiling.');
        return;
      }
    }

    if (await handleEmergencyMessage(ctx, bot, userService, emergencyService)) {
      return;
    }
  });
};
