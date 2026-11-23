import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { TelegrafLifecycle } from './telegraf.lifecycle.js';

/**
 * 持有唯一的 Telegraf 實例，並負責它的啟動與關閉。
 *
 * 以 `Telegraf` 類別作為注入 token。handler 由使用方在 `onModuleInit`
 * 註冊，polling 在 `onApplicationBootstrap` 才開始，所以不會漏掉第一批更新。
 */
@Module({
  providers: [
    {
      provide: Telegraf,
      useFactory: (config: ConfigService) =>
        new Telegraf(config.getOrThrow<string>('telegram.botToken')),
      inject: [ConfigService],
    },
    TelegrafLifecycle,
  ],
  exports: [Telegraf],
})
export class TelegrafModule {}
