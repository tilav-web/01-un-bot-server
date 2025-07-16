import { Injectable } from '@nestjs/common';
import { Bot, InputFile } from 'grammy';
import { UserService } from '../user/user.service';
import { config } from 'dotenv';
import { registerHandlers } from './handlers';
import { EmergencyService } from '../emergency/emergency.service';
import { GroupService } from '../group/group.service';

@Injectable()
export class BotService {
  private bot: Bot;
  constructor(
    private readonly userService: UserService,
    private readonly emergencyService: EmergencyService,
    private readonly groupService: GroupService,
  ) {
    config(); // Ensure dotenv is loaded before accessing process.env
    this.bot = new Bot(process.env.BOT_TOKEN);
    this.registerHandlers();
  }

  private registerHandlers() {
    registerHandlers(
      this.bot,
      this.userService,
      this.emergencyService,
      this.groupService,
    );
  }

  async launch() {
    try {
      await this.bot.start();
      console.log('🤖 Bot ishga tushdi');
    } catch (error) {
      console.error('❌ Botni ishga tushirishda xato yuz berdi:', error);
    }
  }

  async stop() {
    try {
      await this.bot.stop();
      console.log('Bot to‘xtatildi');
    } catch (error) {
      console.error('Botni to‘xtatishda xato:', error);
    }
  }

  async sendMessage(chatId: number, message: string) {
    try {
      await this.bot.api.sendMessage(chatId, message);
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to send message to chat ${chatId}: ${error.message}`,
      );
    }
  }

  async sendPhoto(chatId: number, photoPath: string, caption?: string) {
    try {
      await this.bot.api.sendPhoto(chatId, new InputFile(photoPath), {
        caption,
      });
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to send photo to chat ${chatId}: ${error.message}`,
      );
    }
  }

  async sendVideo(chatId: number, videoPath: string, caption?: string) {
    try {
      await this.bot.api.sendVideo(chatId, new InputFile(videoPath), {
        caption,
      });
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to send video to chat ${chatId}: ${error.message}`,
      );
    }
  }

  async sendDocument(chatId: number, documentPath: string, caption?: string) {
    try {
      await this.bot.api.sendDocument(chatId, new InputFile(documentPath), {
        caption,
      });
    } catch (error) {
      console.error(error);
      throw new Error(
        `Failed to send document to chat ${chatId}: ${error.message}`,
      );
    }
  }
}
