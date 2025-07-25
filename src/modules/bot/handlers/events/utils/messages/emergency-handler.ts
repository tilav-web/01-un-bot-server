import { Bot, InlineKeyboard } from 'grammy';
import { Types } from 'mongoose';
import { EmergencyService } from 'src/modules/emergency/emergency.service';
import {
  EmergencyStatus,
  EmergencyType,
} from 'src/modules/emergency/schemas/emergency.schema';
import { UserService } from 'src/modules/user/user.service';

export const handleEmergencyMessage = async (
  ctx: any,
  bot: Bot,
  userService: UserService,
  emergencyService: EmergencyService,
) => {
  const user = await userService.findOne(ctx.from.id);

  if (!user) {
    // Handle case where user is not found, maybe reply with a message or log
    return false;
  }

  // Delete previous bot message if exists (this logic is fine here)
  if (user.action_message_id) {
    try {
      await bot.api.deleteMessage(ctx.chat.id, user.action_message_id);
    } catch (error) {
      console.error('Failed to delete previous bot message:', error);
    }
    const groupId = process.env.GROUP_ID;
    if (!groupId) {
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib koʻring.');
      return;
    }

    const userInfo = `<b>Foydalanuvchi ma'lumotlari:</b>
Ism: ${user.full_name}
Telegram ID: <code>${user.telegram_id}</code>
${user.username ? `Username: @${user.username}` : ''}`;

    let sentMessageInGroup;
    let messageType: string | undefined;
    let messageContent: string | undefined;

    if (ctx.message.text) {
      messageType = 'text';
      messageContent = ctx.message.text;
      sentMessageInGroup = await bot.api.sendMessage(
        groupId,
        `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.text}`,
        { parse_mode: 'HTML' },
      );
    } else if (ctx.message.photo) {
      messageType = 'photo';
      messageContent = ctx.message.caption;
      sentMessageInGroup = await bot.api.sendPhoto(
        groupId,
        ctx.message.photo[ctx.message.photo.length - 1].file_id,
        {
          caption: `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.caption || ''}`,
          parse_mode: 'HTML',
        },
      );
    } else if (ctx.message.video) {
      messageType = 'video';
      messageContent = ctx.message.caption;
      sentMessageInGroup = await bot.api.sendVideo(
        groupId,
        ctx.message.video.file_id,
        {
          caption: `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.caption || ''}`,
          parse_mode: 'HTML',
        },
      );
    } else if (ctx.message.document) {
      messageType = 'document';
      messageContent = ctx.message.caption;
      sentMessageInGroup = await bot.api.sendDocument(
        groupId,
        ctx.message.document.file_id,
        {
          caption: `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.caption || ''}`,
          parse_mode: 'HTML',
        },
      );
    } else if (ctx.message.audio) {
      messageType = 'audio';
      messageContent = ctx.message.caption;
      sentMessageInGroup = await bot.api.sendAudio(
        groupId,
        ctx.message.audio.file_id,
        {
          caption: `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.caption || ''}`,
          parse_mode: 'HTML',
        },
      );
    } else if (ctx.message.voice) {
      messageType = 'voice';
      messageContent = ctx.message.caption;
      sentMessageInGroup = await bot.api.sendVoice(
        groupId,
        ctx.message.voice.file_id,
        {
          caption: `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.caption || ''}`,
          parse_mode: 'HTML',
        },
      );
    } else if (ctx.message.animation) {
      messageType = 'animation';
      messageContent = ctx.message.caption;
      sentMessageInGroup = await bot.api.sendAnimation(
        groupId,
        ctx.message.animation.file_id,
        {
          caption: `${userInfo}\n\n<b>Xabar:</b>\n${ctx.message.caption || ''}`,
          parse_mode: 'HTML',
        },
      );
    } else {
      // Handle other message types by sending a text message indicating the type
      messageType = 'other';
      messageContent = `Foydalanuvchi ${ctx.message.type} turidagi xabar yubordi.`;
      sentMessageInGroup = await bot.api.sendMessage(
        groupId,
        `${userInfo}\n\n<b>Xabar:</b>\n${messageContent}`,
        { parse_mode: 'HTML' },
      );
    }

    if (!sentMessageInGroup) {
      await ctx.reply('Xabar guruhga yuborishda xatolik yuz berdi.');
      return;
    }

    await emergencyService.create({
      user: new Types.ObjectId(user._id.toString()),
      user_message_id: ctx.message.message_id,
      group_message_id: sentMessageInGroup.message_id,
      status: EmergencyStatus.PENDING,
      type: EmergencyType.PENDING,
      message_type: messageType,
      message_content: messageContent,
    });

    const inlineKeyboard = new InlineKeyboard()
      .text('Tasdiqlash', `confirm_emergency:${sentMessageInGroup.message_id}`)
      .text(
        'Bekor qilish',
        `cancel_emergency:${sentMessageInGroup.message_id}`,
      );

    await ctx.reply(
      'Siz yuborgan xabar uchun javobgarlikni oʻz zimmangizga olasizmi? Yolgʻon xabar berish qonunga muvofiq javobgarlikka sabab boʻlishi mumkin.',
      {
        reply_markup: inlineKeyboard,
      },
    );
    return true;
  }
  return false;
};
