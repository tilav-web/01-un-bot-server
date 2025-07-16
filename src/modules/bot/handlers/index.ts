import { Bot } from 'grammy';
import { UserService } from 'src/modules/user/user.service';
import { startCommand } from './commands/start.command';
import { myChatMemberEvent } from './events/my-chat-member.event';

import { EmergencyService } from 'src/modules/emergency/emergency.service';
import { messageEvent } from './events/message.event';
import { callbackQueryEvent } from './events/callback_query.event';
import { GroupService } from 'src/modules/group/group.service';

export const registerHandlers = (
  bot: Bot,
  userService: UserService,
  emergencyService: EmergencyService,
  groupService: GroupService,
) => {
  startCommand(bot, userService);
  myChatMemberEvent(bot, userService, groupService);
  messageEvent(bot, userService, emergencyService);
  callbackQueryEvent(bot, userService, emergencyService);
};
