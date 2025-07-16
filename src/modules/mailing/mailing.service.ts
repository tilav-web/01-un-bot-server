import { Injectable } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { SendGroupMessageDto } from './dto/send-group-message.dto';
import { BotService } from 'src/modules/bot/bot.service';
import { UserService } from 'src/modules/user/user.service';
import { GroupService } from 'src/modules/group/group.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailingService {
  constructor(
    private readonly botService: BotService,
    private readonly userService: UserService,
    private readonly groupService: GroupService,
  ) {}

  async sendMessage(
    sendMessageDto: SendMessageDto,
    files: Array<Express.Multer.File>,
  ) {
    const { userIds, text } = sendMessageDto;
    let targetUserIds: string[] = [];

    if (userIds.length === 0) {
      // If userIds is empty, send to all active users
      const allUsers = await this.userService.findAllActiveUsers();
      targetUserIds = allUsers.map((user) => user.telegram_id.toString()); // Convert to string for consistency
    } else {
      // Send to specific active users
      const selectedUsers =
        await this.userService.findActiveUsersByIds(userIds);
      targetUserIds = selectedUsers.map((user) => user.telegram_id.toString()); // Convert to string for consistency
    }

    for (const telegramId of targetUserIds) {
      try {
        const chatId = Number(telegramId); // Convert to number for bot service
        if (files && files.length > 0) {
          for (const file of files) {
            const filePath = path.resolve(file.path);
            const mimeType = file.mimetype;

            if (mimeType.startsWith('image')) {
              await this.botService.sendPhoto(chatId, filePath, text);
            } else if (mimeType.startsWith('video')) {
              await this.botService.sendVideo(chatId, filePath, text);
            } else {
              await this.botService.sendDocument(chatId, filePath, text);
            }
            // Optionally, delete the file after sending
            // fs.unlinkSync(filePath);
          }
        } else if (text) {
          await this.botService.sendMessage(chatId, text);
        }
      } catch (error) {
        console.error(`Failed to send message to user ${telegramId}:`, error);
      }
    }

    // Clean up uploaded files after all messages are processed
    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = path.resolve(file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    return { success: true, message: 'Messages are being sent.' };
  }

  async sendGroupMessage(
    sendGroupMessageDto: SendGroupMessageDto,
    files: Array<Express.Multer.File>,
  ) {
    const { groupIds, text } = sendGroupMessageDto;
    let targetGroupIds: number[] = [];

    if (groupIds.length === 0) {
      const allGroups = await this.groupService.findAll();
      targetGroupIds = allGroups.map((group) => group.group);
    } else {
      const selectedGroups = await this.groupService.findByIds(groupIds);
      targetGroupIds = selectedGroups
        .filter((group) => group !== null)
        .map((group) => group.group);
    }

    for (const telegramId of targetGroupIds) {
      try {
        const chatId = Number(telegramId);
        if (files && files.length > 0) {
          for (const file of files) {
            const filePath = path.resolve(file.path);
            const mimeType = file.mimetype;

            if (mimeType.startsWith('image')) {
              await this.botService.sendPhoto(chatId, filePath, text);
            } else if (mimeType.startsWith('video')) {
              await this.botService.sendVideo(chatId, filePath, text);
            } else {
              await this.botService.sendDocument(chatId, filePath, text);
            }
          }
        } else if (text) {
          await this.botService.sendMessage(chatId, text);
        }
      } catch (error) {
        console.error(`Failed to send message to group ${telegramId}:`, error);
      }
    }

    if (files && files.length > 0) {
      for (const file of files) {
        const filePath = path.resolve(file.path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    return { success: true, message: 'Group messages are being sent.' };
  }
}
