import { Bot, InlineKeyboard } from 'grammy';
import { Types } from 'mongoose';
import { EmergencyService } from 'src/modules/emergency/emergency.service';
import { EmergencyStatus, EmergencyType } from 'src/modules/emergency/schemas/emergency.schema';
import { UserService } from 'src/modules/user/user.service';

export const handleEmergencyMessage = async (
  ctx: any,
  bot: Bot,
  userService: UserService,
  emergencyService: EmergencyService,
) => {
  const user = await userService.findOne(ctx.from.id);

  if (user && user.action === 'awaiting_emergency_message') {
    const groupId = process.env.GROUP_ID;
    if (!groupId) {
      await ctx.reply('Xatolik yuz berdi. Iltimos, keyinroq urinib koʻring.');
      return;
    }

    let messageType: string | undefined;
    let messageContent: string | undefined;

    if (ctx.message.text) {
      messageType = 'text';
      messageContent = ctx.message.text;
    } else if (ctx.message.photo) {
      messageType = 'photo';
      messageContent = ctx.message.caption;
    } else if (ctx.message.video) {
      messageType = 'video';
      messageContent = ctx.message.caption;
    } else if (ctx.message.document) {
      messageType = 'document';
      messageContent = ctx.message.caption;
    } else if (ctx.message.audio) {
      messageType = 'audio';
      messageContent = ctx.message.caption;
    } else if (ctx.message.voice) {
      messageType = 'voice';
      messageContent = ctx.message.caption;
    } else if (ctx.message.sticker) {
      messageType = 'sticker';
    } else if (ctx.message.animation) {
      messageType = 'animation';
      messageContent = ctx.message.caption;
    } else if (ctx.message.video_note) {
      messageType = 'video_note';
    } else if (ctx.message.contact) {
      messageType = 'contact';
    } else if (ctx.message.location) {
      messageType = 'location';
    } else if (ctx.message.venue) {
      messageType = 'venue';
    } else if (ctx.message.poll) {
      messageType = 'poll';
    } else if (ctx.message.dice) {
      messageType = 'dice';
    } else if (ctx.message.game) {
      messageType = 'game';
    } else if (ctx.message.invoice) {
      messageType = 'invoice';
    } else if (ctx.message.successful_payment) {
      messageType = 'successful_payment';
    } else if (ctx.message.passport_data) {
      messageType = 'passport_data';
    } else if (ctx.message.proximity_alert_triggered) {
      messageType = 'proximity_alert_triggered';
    } else if (ctx.message.forum_topic_created) {
      messageType = 'forum_topic_created';
    } else if (ctx.message.forum_topic_closed) {
      messageType = 'forum_topic_closed';
    } else if (ctx.message.forum_topic_reopened) {
      messageType = 'forum_topic_reopened';
    } else if (ctx.message.video_chat_started) {
      messageType = 'video_chat_started';
    } else if (ctx.message.video_chat_ended) {
      messageType = 'video_chat_ended';
    } else if (ctx.message.video_chat_participants_invited) {
      messageType = 'video_chat_participants_invited';
    } else if (ctx.message.web_app_data) {
      messageType = 'web_app_data';
    } else if (ctx.message.story) {
      messageType = 'story';
    } else if (ctx.message.chat_background_set) {
      messageType = 'chat_background_set';
    } else if (ctx.message.boost_added) {
      messageType = 'boost_added';
    } else if (ctx.message.chat_shared) {
      messageType = 'chat_shared';
    } else if (ctx.message.users_shared) {
      messageType = 'user_shared';
    } else if (ctx.message.write_access_allowed) {
      messageType = 'write_access_allowed';
    } else if (ctx.message.giveaway_created) {
      messageType = 'giveaway_created';
    } else if (ctx.message.giveaway) {
      messageType = 'giveaway';
    } else if (ctx.message.giveaway_winners) {
      messageType = 'giveaway_winners';
    } else if (ctx.message.giveaway_completed) {
      messageType = 'giveaway_completed';
    } else if (ctx.message.message_auto_delete_timer_changed) {
      messageType = 'message_auto_delete_timer_changed';
    } else if (ctx.message.new_chat_members) {
      messageType = 'new_chat_members';
    } else if (ctx.message.left_chat_member) {
      messageType = 'left_chat_member';
    } else if (ctx.message.new_chat_title) {
      messageType = 'new_chat_title';
    } else if (ctx.message.new_chat_photo) {
      messageType = 'new_chat_photo';
    } else if (ctx.message.delete_chat_photo) {
      messageType = 'delete_chat_photo';
    } else if (ctx.message.group_chat_created) {
      messageType = 'group_chat_created';
    } else if (ctx.message.supergroup_chat_created) {
      messageType = 'supergroup_chat_created';
    } else if (ctx.message.channel_chat_created) {
      messageType = 'channel_chat_created';
    } else if (ctx.message.migrate_to_chat_id) {
      messageType = 'migrate_to_chat_id';
    } else if (ctx.message.migrate_from_chat_id) {
      messageType = 'migrate_from_chat_id';
    } else if (ctx.message.pinned_message) {
      messageType = 'pinned_message';
    }

    const copiedMessage = await bot.api.copyMessage(
      groupId,
      ctx.chat.id,
      ctx.message.message_id,
    );

    await emergencyService.create({
      user: new Types.ObjectId(user._id.toString()),
      user_message_id: ctx.message.message_id,
      group_message_id: copiedMessage.message_id,
      status: EmergencyStatus.PENDING,
      type: EmergencyType.PENDING,
      message_type: messageType,
      message_content: messageContent,
    });

    user.action = null;
    await user.save();

    const inlineKeyboard = new InlineKeyboard()
      .text('Tasdiqlash', `confirm_emergency:${copiedMessage.message_id}`)
      .text('Bekor qilish', `cancel_emergency:${copiedMessage.message_id}`);

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
