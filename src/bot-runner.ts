import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BotService } from './modules/bot/bot.service';

async function bootstrapBot() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const botService = appContext.get(BotService);
  await botService.launch();
  console.log('🤖 Bot alohida ishga tushdi');
}

bootstrapBot();