import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { EmergencyService } from 'src/modules/emergency/emergency.service';
import { EmergencyStatus } from 'src/modules/emergency/schemas/emergency.schema';

export const callbackQueryEvent = (
  bot: Bot,
  userService: UserService,
  emergencyService: EmergencyService,
) => {
  bot.on('callback_query:data', async (ctx) => {
    const [action, groupMessageId] = ctx.callbackQuery.data.split(':');
    const user = await userService.findOne(ctx.from.id);

    if (!user) {
      return;
    }

    const groupId = process.env.GROUP_ID;
    if (!groupId) {
      console.error('GROUP_ID .env faylda topilmadi.');
      await ctx.answerCallbackQuery({
        text: 'Xatolik yuz berdi. Iltimos, keyinroq urinib koʻring.',
        show_alert: true,
      });
      return;
    }

    try {
      let statusText = '';
      let emergencyStatus: EmergencyStatus;

      if (action === 'confirm_emergency') {
        statusText = '✅ <b>Tasdiqlangan xabar:</b>';
        emergencyStatus = EmergencyStatus.CONFIRMED;
      } else if (action === 'cancel_emergency') {
        statusText = '❌ <b>Bekor qilingan xabar:</b>';
        emergencyStatus = EmergencyStatus.CANCELED;
      } else {
        await ctx.answerCallbackQuery({
          text: 'Nomaʼlum amal.',
          show_alert: true,
        });
        return;
      }

      // Update the emergency record in the database
      const updatedEmergency = await emergencyService.updateEmergencyStatus(
        parseInt(groupMessageId, 10),
        emergencyStatus,
      );

      if (!updatedEmergency) {
        await ctx.answerCallbackQuery({
          text: 'Xatolik yuz berdi. Murojaat topilmadi.',
          show_alert: true,
        });
        return;
      }

      let newText = '';
      let newCaption = '';
      const parseMode: 'HTML' | undefined = 'HTML';

      if (updatedEmergency.message_type === 'text') {
        newText = `${statusText}\n\n${updatedEmergency.message_content}`;
      } else if (
        updatedEmergency.message_type === 'photo' ||
        updatedEmergency.message_type === 'video' ||
        updatedEmergency.message_type === 'document' ||
        updatedEmergency.message_type === 'audio' ||
        updatedEmergency.message_type === 'voice' ||
        updatedEmergency.message_type === 'animation'
      ) {
        newCaption = `${statusText}\n\n${updatedEmergency.message_content || ''}`;
      } else {
        // For messages without text or caption (e.g., stickers, voice messages without caption)
        // We will just send the status text and then edit the message without modification.
        await bot.api.editMessageCaption(
          groupId,
          parseInt(groupMessageId, 10),
          {
            caption: statusText,
            parse_mode: 'HTML',
          },
        );
        await ctx.answerCallbackQuery({
          text: `Murojaat ${action === 'confirm_emergency' ? 'tasdiqlandi' : 'bekor qilindi'}!`,
        });
        await ctx.editMessageText(
          `Murojaatingiz ${action === 'confirm_emergency' ? 'tasdiqlandi' : 'bekor qilindi'}.`,
        );
        return;
      }

      if (updatedEmergency.message_type === 'text') {
        await bot.api.editMessageText(
          groupId,
          parseInt(groupMessageId, 10),
          newText,
          {
            parse_mode: parseMode,
          },
        );
      } else if (
        updatedEmergency.message_type === 'photo' ||
        updatedEmergency.message_type === 'video' ||
        updatedEmergency.message_type === 'document' ||
        updatedEmergency.message_type === 'audio' ||
        updatedEmergency.message_type === 'voice' ||
        updatedEmergency.message_type === 'animation'
      ) {
        await bot.api.editMessageCaption(
          groupId,
          parseInt(groupMessageId, 10),
          {
            caption: newCaption,
            parse_mode: parseMode,
          },
        );
      }

      await ctx.answerCallbackQuery({
        text: `Murojaat ${action === 'confirm_emergency' ? 'tasdiqlandi' : 'bekor qilindi'}!`,
      });

      // Delete user's original message
      if (updatedEmergency.user_message_id) {
        try {
          await bot.api.deleteMessage(ctx.from.id, updatedEmergency.user_message_id);
        } catch (deleteError) {
          console.error('Failed to delete user message:', deleteError);
        }
      }

      // Delete bot's confirmation message
      if (ctx.callbackQuery.message) {
        try {
          await bot.api.deleteMessage(ctx.chat.id, ctx.callbackQuery.message.message_id);
        } catch (deleteError) {
          console.error('Failed to delete bot confirmation message:', deleteError);
        }
      }

      // Reprompt user for new message
      user.action = 'awaiting_emergency_message';
      await userService.update(user.telegram_id, { action: 'awaiting_emergency_message' });
      const sentMessage = await ctx.reply('Iltimos, keyingi xabaringizni yuboring (matn, rasm, video va hokazo).');
      await userService.update(user.telegram_id, { action_message_id: sentMessage.message_id });
    } catch (error) {
      console.error('Callback query xatoligi:', error);
      await ctx.answerCallbackQuery({
        text: 'Xatolik yuz berdi. Iltimos, qaytadan urinib koʻring.',
        show_alert: true,
      });
    }
  });
};
