import { UserService } from 'src/modules/user/user.service';
import { UserStatus } from 'src/modules/user/schemas/user.schema';
import { REPORT_BUTTON_TEXT } from 'src/modules/bot/constants';

export const handleReportCommand = async (
  ctx: any,
  userService: UserService,
) => {
  if (ctx.message.text === REPORT_BUTTON_TEXT) {
    const user = await userService.findOne(ctx.from.id);
    if (user) {
      if (user.status === UserStatus.BLOCK) {
        return true;
      }
      user.action = 'awaiting_emergency_message';
      await user.save();
    }
    await ctx.reply(
      'Iltimos, xabaringizni yuboring (matn, rasm, video va hokazo).',
    );
    return true;
  }
  return false;
};
