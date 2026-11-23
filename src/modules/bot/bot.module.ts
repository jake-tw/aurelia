import { Module } from '@nestjs/common';
import { BotService } from './bot.service.js';
import { BotUpdate } from './bot.update.js';
import { TelegramModule } from '../../integrations/telegram/telegram.module.js';
import { TelegrafModule } from '../../infrastructure/telegraf/telegraf.module.js';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';

@Module({
  imports: [
    TelegramModule, // 底層 Telegram API
    TelegrafModule, // Telegraf 實例（BotUpdate 註冊 handler 用）
    DatabaseModule, // 資料庫
  ],
  providers: [BotService, BotUpdate],
  exports: [BotService],
})
export class BotModule {}
