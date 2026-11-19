import { Module } from '@nestjs/common';
import { BotService } from './bot.service.js';
import { BotUpdate } from './bot.update.js';
import { TelegramModule } from '../../integrations/telegram/telegram.module.js';
import { DatabaseModule } from '../../infrastructure/database/database.module.js';

@Module({
  imports: [
    TelegramModule,    // 底層 Telegram API
    DatabaseModule,    // 資料庫
    // TODO: 安裝並導入 TelegrafModule
    // TelegrafModule.forRootAsync({
    //   useFactory: (config: ConfigService) => ({
    //     token: config.get<string>('telegram.botToken'),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  providers: [
    BotService,
    // BotUpdate,  // 安裝 telegraf 後解除註解
  ],
  exports: [BotService],
})
export class BotModule {}
