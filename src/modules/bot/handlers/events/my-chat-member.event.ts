import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { UserStatus } from 'src/modules/user/schemas/user.schema';
import { GroupService } from 'src/modules/group/group.service';
import { GroupStatus } from 'src/modules/group/schemas/group.schema';

export const myChatMemberEvent = (
  bot: Bot,
  userService: UserService,
  groupService: GroupService,
) => {
  bot.on('my_chat_member', async (ctx) => {
    const { new_chat_member, chat } = ctx.myChatMember;
    const telegram_id = ctx.from.id;
    const user = await userService.findOne(telegram_id);

    // If user is blocked, do not process further
    if (user && user.status === UserStatus.BLOCK) {
      return;
    }

    // Update user status regardless of chat type
    if (new_chat_member.status === 'kicked') {
      if (user) {
        await userService.update(telegram_id, {
          status: UserStatus.NOT_ACTIVE,
        });
      }
    } else if (
      new_chat_member.status === 'member' ||
      new_chat_member.status === 'administrator'
    ) {
      if (user && user.status === UserStatus.NOT_ACTIVE) {
        await userService.update(telegram_id, { status: UserStatus.ACTIVE });
      }
    }

    // Process group status only for group/supergroup/channel chats
    if (
      chat.type === 'group' ||
      chat.type === 'supergroup' ||
      chat.type === 'channel'
    ) {
      const groupId = chat.id;
      let group = await groupService.findOne(groupId);

      if (new_chat_member.status === 'kicked') {
        if (group) {
          await groupService.update(groupId, {
            status: GroupStatus.NOT_ACTIVE,
          });
        } else {
          console.warn(
            `Bot kicked from group ${chat.title} (${groupId}), but group not found in DB.`,
          );
        }
      } else if (
        new_chat_member.status === 'member' ||
        new_chat_member.status === 'administrator'
      ) {
        if (group) {
          if (group.status !== GroupStatus.BLOCKED) {
            await groupService.update(groupId, { status: GroupStatus.ACTIVE });
          }
        } else {
          group = await groupService.create({
            group: groupId,
            telegram_id: telegram_id, // Botni qo'shgan foydalanuvchi
            name: chat.title, // chat.title is guaranteed to exist for group/supergroup/channel
            username: chat.username,
            status: GroupStatus.ACTIVE,
          });
        }
      }
    }
  });
};
