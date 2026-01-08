import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { User, UserStatus } from 'src/modules/user/schemas/user.schema';

export const startCommand = (bot: Bot, userService: UserService) => {
  bot.command('start', async (ctx) => {
    const from = ctx.from;
    if (!from) {
      return;
    }

    let user: User & { save: () => Promise<any> };
    const existingUser = await userService.findOne(from.id);

    if (existingUser) {
      if (existingUser.status === UserStatus.BLOCK) {
        return;
      }
      user = existingUser;
      if (user.status === UserStatus.NOT_ACTIVE) {
        user.status = UserStatus.ACTIVE;
      }
    } else {
      user = await userService.create({
        telegram_id: from.id,
        full_name: `${from.first_name} ${from.last_name || ''}`.trim(),
        username: from.username,
      });
    }

    user.action = 'awaiting_emergency_message';
    const sentMessage = await ctx.reply(
      'Iltimos, xabaringizni yuboring (matn, rasm, video va hokazo).',
    );
    user.action_message_id = sentMessage.message_id;

    await user.save();
  });
};
